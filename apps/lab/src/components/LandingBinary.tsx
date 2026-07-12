const BITS = [
  { ch: "1", left: "12%", delay: "0s", dur: "11s", size: "0.85rem" },
  { ch: "0", left: "18%", delay: "1.4s", dur: "13s", size: "0.7rem" },
  { ch: "1", left: "27%", delay: "0.6s", dur: "10s", size: "0.95rem" },
  { ch: "0", left: "34%", delay: "2.2s", dur: "14s", size: "0.75rem" },
  { ch: "1", left: "42%", delay: "0.9s", dur: "12s", size: "0.8rem" },
  { ch: "0", left: "51%", delay: "1.8s", dur: "11s", size: "0.9rem" },
  { ch: "1", left: "58%", delay: "0.3s", dur: "13s", size: "0.7rem" },
  { ch: "0", left: "66%", delay: "2.6s", dur: "10s", size: "1rem" },
  { ch: "1", left: "73%", delay: "1.1s", dur: "12s", size: "0.75rem" },
  { ch: "0", left: "81%", delay: "0.5s", dur: "14s", size: "0.85rem" },
  { ch: "1", left: "88%", delay: "2s", dur: "11s", size: "0.7rem" },
  { ch: "0", left: "22%", delay: "3.1s", dur: "15s", size: "0.65rem" },
  { ch: "1", left: "47%", delay: "2.8s", dur: "9s", size: "0.8rem" },
  { ch: "0", left: "69%", delay: "3.4s", dur: "13s", size: "0.7rem" },
  { ch: "1", left: "76%", delay: "1.6s", dur: "10s", size: "0.9rem" },
];

export function LandingBinary() {
  return (
    <div className="landing-binary" aria-hidden="true">
      {BITS.map((bit, i) => (
        <span
          key={`${bit.ch}-${i}`}
          className="landing-binary__bit"
          style={{
            left: bit.left,
            animationDelay: bit.delay,
            animationDuration: bit.dur,
            fontSize: bit.size,
          }}
        >
          {bit.ch}
        </span>
      ))}
    </div>
  );
}
