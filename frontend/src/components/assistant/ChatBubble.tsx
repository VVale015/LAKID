import { Bot } from "lucide-react";
import type { ChatMessage } from "@/types";

export default function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.author === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <p className="max-w-[80%] rounded-3xl rounded-br-md bg-sky-700 px-4 py-3 text-base text-white shadow-sm">
          {message.text}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
        <Bot className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="max-w-[80%] rounded-3xl rounded-bl-md bg-slate-100 px-4 py-3 text-base leading-relaxed text-slate-800">
        {message.text}
      </p>
    </div>
  );
}
