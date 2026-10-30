//services/assistant.ts

import { assistantContent, assistantFallback } from "@/data";
import type { AssistantAudience } from "@/types";

const RESPONSE_DELAY_MS = 600;

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function askAssistant(audience: AssistantAudience, question: string): Promise<string> {
  const text = normalize(question);
  const match = assistantContent[audience].find((topic) =>
    topic.keywords.some((keyword) => text.includes(keyword)),
  );
  const reply = match?.reply ?? assistantFallback[audience];
  return new Promise((resolve) => setTimeout(() => resolve(reply), RESPONSE_DELAY_MS));
}
