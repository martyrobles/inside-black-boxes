"""Align transcript turns to Whisper word times. Standard library only."""
from __future__ import annotations

import difflib
import json
import re
import sys
from pathlib import Path


def norm_token(word: str) -> str:
    word = word.lower().replace("’", "'").replace("“", "").replace("”", "")
    return re.sub(r"[^a-z0-9']", "", word)


def align(turns: list[dict], words: list[dict]) -> None:
    official: list[str] = []
    owners: list[int] = []
    for index, turn in enumerate(turns):
        for raw in turn["text"].split():
            token = norm_token(raw)
            if token:
                official.append(token)
                owners.append(index)

    whisper: list[str] = []
    whisper_times: list[float] = []
    for word in words:
        token = norm_token(str(word.get("word", "")))
        start = word.get("start")
        if not token or not isinstance(start, (int, float)):
            continue
        whisper.append(token)
        whisper_times.append(float(start))
    if not whisper:
        raise SystemExit("Word times were empty.")

    matcher = difflib.SequenceMatcher(a=official, b=whisper, autojunk=False)
    for tag, i1, i2, j1, _j2 in matcher.get_opcodes():
        if tag != "equal":
            continue
        for offset in range(i2 - i1):
            turn = turns[owners[i1 + offset]]
            if "start" not in turn:
                turn["start"] = round(whisper_times[j1 + offset], 2)

    duration = whisper_times[-1]
    timed = [turn for turn in turns if "start" in turn]
    if len(timed) < len(turns) * 0.8:
        raise SystemExit(f"Alignment only timed {len(timed)} of {len(turns)} turns.")

    for index, turn in enumerate(turns):
        if "start" in turn:
            continue
        prev_start = next(
            (turns[j]["start"] for j in range(index - 1, -1, -1) if "start" in turns[j]),
            0,
        )
        next_start = next(
            (turns[j]["start"] for j in range(index + 1, len(turns)) if "start" in turns[j]),
            None,
        )
        if next_start is None:
            turn["start"] = round(prev_start + 0.4, 2)
            continue
        run: list[dict] = []
        k = index
        while k < len(turns) and "start" not in turns[k]:
            run.append(turns[k])
            k += 1
        span = max(next_start - prev_start, 0.5)
        step = span / (len(run) + 1)
        for n, item in enumerate(run, start=1):
            item["start"] = round(prev_start + step * n, 2)

    last = -1.0
    for turn in turns:
        if turn["start"] < last:
            turn["start"] = round(last + 0.05, 2)
        last = turn["start"]

    for index, turn in enumerate(turns):
        nxt = turns[index + 1]["start"] if index + 1 < len(turns) else duration
        turn["end"] = round(max(nxt, turn["start"] + 0.35), 2)


def main() -> None:
    turns_path, words_path, out_path = sys.argv[1:]
    turns = json.loads(Path(turns_path).read_text())
    words = json.loads(Path(words_path).read_text())
    align(turns, words)
    Path(out_path).write_text(json.dumps(turns))


if __name__ == "__main__":
    main()
