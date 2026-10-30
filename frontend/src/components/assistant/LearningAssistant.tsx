import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Bot, Send } from "lucide-react";
import { assistantContent } from "@/data";
import { useApp } from "@/store";
import { useAssistantChat } from "@/hooks/useAssistantChat";
import type { AssistantAudience } from "@/types";
import ChatBubble from "./ChatBubble";

interface Props {
  audience: AssistantAudience;
  onBack: () => void;
}

const copy: Record<AssistantAudience, { title: string; intro: string; welcome: (name: string) => string; hint: string }> = {
  student: {
    title: "Asistente de aprendizaje",
    intro: "Un amigo para resolver tus dudas, con frases cortas y ejemplos.",
    welcome: (name) => `¡Hola, ${name}! Soy tu asistente de aprendizaje. Pregúntame lo que necesites.`,
    hint: "Escribe tu pregunta o toca un botón.",
  },
  guardian: {
    title: "Orientaciones para acompañar",
    intro: "Ideas sencillas para apoyar el aprendizaje de su hijo en casa.",
    welcome: (name) => `Hola. Soy el asistente de apoyo para acudientes. Puedo darle ideas para acompañar a ${name} en casa.`,
    hint: "Escriba su pregunta o elija una sugerencia.",
  },
};

export default function LearningAssistant({ audience, onBack }: Props) {
  const { currentStudent, allStudents } = useApp();
  const studentName = (currentStudent ?? allStudents[0]).name;
  const text = copy[audience];
  const { messages, pending, error, send } = useAssistantChat(audience, text.welcome(studentName));
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, pending]);

  const submitSuggestion = (question: string) => {
    void send(question);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const question = draft;
    setDraft("");
    void send(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-indigo-50">
      <div className="bg-white/90 backdrop-blur-sm px-5 py-4 flex items-center gap-3 sticky top-0 z-10 border-b border-slate-100">
        <button
          onClick={onBack}
          aria-label="Volver al panel"
          className="p-2 rounded-full hover:bg-slate-100 transition text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-slate-800">{text.title}</h1>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        <div className="bg-white rounded-3xl p-5 shadow-sm flex items-start gap-4">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <Bot className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <p className="font-extrabold text-slate-800">{text.title}</p>
            <p className="text-sm text-slate-600">{text.intro}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label="Conversación con el asistente"
            className="h-[360px] overflow-y-auto p-4 space-y-3"
          >
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} />
            ))}
            {pending && (
              <div className="flex items-center gap-2 text-sm text-slate-500" role="status">
                <Bot className="h-4 w-4" aria-hidden="true" />
                <span>El asistente está escribiendo</span>
                <span className="motion-safe:animate-pulse">...</span>
              </div>
            )}
            {error && (
              <p className="text-sm font-bold text-red-700" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="border-t border-slate-100 p-4 space-y-3">
            <div className="flex flex-wrap gap-2" aria-label="Preguntas frecuentes">
              {assistantContent[audience].map((item) => (
                <button
                  key={item.topic}
                  onClick={() => submitSuggestion(item.question)}
                  disabled={pending}
                  className="px-4 py-2 rounded-full border-2 border-sky-200 bg-sky-50 text-sm font-bold text-sky-800 hover:border-sky-400 disabled:opacity-50 transition"
                >
                  {item.question}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <label htmlFor="assistant-input" className="sr-only">
                Escribe tu pregunta
              </label>
              <input
                id="assistant-input"
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={text.hint}
                className="flex-1 min-w-0 px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-sky-400 focus:outline-none text-slate-800"
              />
              <button
                type="submit"
                disabled={pending || !draft.trim()}
                aria-label="Enviar pregunta"
                className="p-3.5 rounded-2xl bg-sky-700 text-white shadow-md hover:bg-sky-800 disabled:opacity-40 active:scale-95 transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <p className="text-xs text-center text-slate-500">
          Respuestas de demostración con datos de ejemplo.
        </p>
      </div>
    </div>
  );
}
