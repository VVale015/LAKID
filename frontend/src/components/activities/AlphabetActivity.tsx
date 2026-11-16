// frontend/src/components/activities/AlphabetActivity.tsx

import { useState, useEffect } from "react";
import { ArrowLeft, Volume2 } from "lucide-react";
import { letterQuestions } from "@/data";
import FeedbackBanner from "@/components/FeedbackBanner";
import { useApp } from "@/store";
import type { AreaKey } from "@/types";
import { registrarResultado, progresoAEstudiante } from "@/services/resultados";

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

function speak(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
}

export default function AlphabetActivity({ onBack, onComplete }: Props) {
  const { currentStudent, completeActivity, updateStudent } = useApp();
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; msg: string } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const question = letterQuestions[index];

  useEffect(() => {
    const timer = setTimeout(() => speak(`Letra ${question.letter}, de ${question.word}`), 300);
    return () => clearTimeout(timer);
  }, [index, question]);

  const handleAnswer = (letter: string) => {
    if (selected) return;
    setSelected(letter);
    const correct = letter === question.letter;
    if (correct) setCorrectCount((n) => n + 1);
    setFeedback({
      type: correct ? "correct" : "incorrect",
      msg: correct ? "¡Excelente!" : "Inténtalo nuevamente",
    });
  };

  const handleFeedbackDone = async () => {
  setFeedback(null);
  setSelected(null);

  if (index + 1 < letterQuestions.length) {
    setIndex(index + 1);
    return;
  }

  // Última pregunta: se registra UNA sola vez el resultado de la actividad
  const porcentaje = Math.round((correctCount / letterQuestions.length) * 100);
    if (currentStudent) {
      // Temporal: mantiene al día las asignaciones locales hasta conectarlas al back
      completeActivity(currentStudent.id, "alphabet" as AreaKey);
      try {
        const resultado = await registrarResultado("alphabet", porcentaje);
        updateStudent(currentStudent.id, progresoAEstudiante(resultado.progreso));
      } catch (e) {
        console.error("No se pudo registrar el resultado", e);
      }
    }
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50">
      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 flex items-center gap-3 sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 transition">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-lg font-extrabold text-slate-700 flex items-center gap-2">
          🔤 Abecedario
        </h1>
        <span className="ml-auto text-sm font-bold text-slate-400">
          {index + 1}/{letterQuestions.length}
        </span>
      </div>

      <div className="max-w-xl mx-auto px-5 py-8 flex flex-col items-center">
        <div className="flex gap-2 mb-8">
          {letterQuestions.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-sky-500" : i < index ? "w-2 bg-sky-300" : "w-2 bg-slate-200"}`}
            />
          ))}
        </div>

        {/* Big letter */}
        <div className="relative mb-4">
          <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-xl">
            <span className="text-8xl font-extrabold text-white">{question.letter}</span>
          </div>
          <button
            onClick={() => speak(`Letra ${question.letter}, de ${question.word}`)}
            className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-sky-500 hover:scale-110 transition"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Word with emoji */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-5xl">{question.emoji}</span>
          <span className="text-2xl font-extrabold text-slate-700">{question.word}</span>
        </div>

        <p className="text-slate-400 mb-6">¿Qué letra es?</p>

        {/* Options */}
        <div className="flex gap-4">
          {question.options.map((letter) => (
            <button
              key={letter}
              onClick={() => handleAnswer(letter)}
              disabled={!!selected}
              className={`w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center text-4xl font-extrabold transition ${
                selected === letter
                  ? letter === question.letter
                    ? "ring-4 ring-green-400 text-green-500 scale-105"
                    : "ring-4 ring-orange-400 text-orange-400 scale-95"
                  : selected && letter === question.letter
                    ? "ring-4 ring-green-300 text-green-400"
                    : "text-sky-500 hover:scale-105"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <FeedbackBanner type={feedback.type} message={feedback.msg} onDone={handleFeedbackDone} />
      )}
    </div>
  );
}
