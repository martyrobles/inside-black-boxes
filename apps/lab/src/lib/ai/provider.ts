import type { WhatCouldBecomeConcept } from "@/lib/ai/types";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiProvider = {
  id: string;
  completeJson: (args: {
    messages: ChatMessage[];
  }) => Promise<{ text: string; model: string }>;
};

function requireApiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to apps/lab/.env.local to use AI features.",
    );
  }
  return key;
}

export function createAiProvider(): AiProvider {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  if (provider !== "openai") {
    throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
  }

  return {
    id: "openai",
    async completeJson({ messages }) {
      const apiKey = requireApiKey();
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          response_format: { type: "json_object" },
          messages,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`OpenAI error (${response.status}): ${body.slice(0, 240)}`);
      }

      const json = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = json.choices?.[0]?.message?.content;
      if (!text) throw new Error("OpenAI returned an empty response.");
      return { text, model };
    },
  };
}

export function parseSummaryResponse(text: string): {
  summary: string;
  themes: string[];
} {
  const parsed = JSON.parse(text) as {
    summary?: string;
    themes?: string[];
  };
  return {
    summary: (parsed.summary || "").trim(),
    themes: Array.isArray(parsed.themes)
      ? parsed.themes.map(String).slice(0, 8)
      : [],
  };
}

export function parseWhatCouldBecomeResponse(text: string): {
  concepts: WhatCouldBecomeConcept[];
} {
  const parsed = JSON.parse(text) as {
    concepts?: WhatCouldBecomeConcept[];
  };
  const concepts = Array.isArray(parsed.concepts) ? parsed.concepts : [];
  return {
    concepts: concepts.slice(0, 5).map((concept) => ({
      title: String(concept.title || "Untitled concept"),
      format: String(concept.format || "Essay"),
      audience: String(concept.audience || "General"),
      centralIdea: String(concept.centralIdea || ""),
      whyItFits: String(concept.whyItFits || ""),
      nextStep: String(concept.nextStep || ""),
    })),
  };
}
