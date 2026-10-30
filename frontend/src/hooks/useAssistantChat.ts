import { useState } from "react";
import { askAssistant } from "@/services/assistant";
import type { AssistantAudience, ChatMessage } from "@/types";

let messageCounter = 0;

const nextId = () => `msg-${Date.now()}-${++messageCounter}`;

export function useAssistantChat(audience: AssistantAudience, welcome: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: nextId(), author: "assistant", text: welcome },
  ]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || pending) return;

    setMessages((prev) => [...prev, { id: nextId(), author: "user", text: question }]);
    setPending(true);
    setError(null);
    try {
      const reply = await askAssistant(audience, question);
      setMessages((prev) => [...prev, { id: nextId(), author: "assistant", text: reply }]);
    } catch {
      setError("No pude responder ahora. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  };

  return { messages, pending, error, send };
}
