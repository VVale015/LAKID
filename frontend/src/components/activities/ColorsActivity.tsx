// frontend/src/components/activities/ColorsActivity.tsx

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { colorQuestions, colorMap } from "@/data";
import FeedbackBanner from "@/components/FeedbackBanner";
import { useApp } from "@/store";
import type { AreaKey } from "@/types";
import { registrarResultado, progresoAEstudiante } from "@/services/resultados";

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

export default function ColorsActivity({ onBack, onComplete }: Props) {
  const { currentStudent, completeActivity, updateStudent } = useApp();
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; msg: string } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  
  const question = colorQuestions[index];

  const handleAnswer = (color: string) => {
    if (selected) return;
    setSelected(color);
    const correct = color === question.correctColor;
    if (correct) setCorrectCount((n) => n + 1);
    setFeedback({
      type: correct ? "correct" : "incorrect",
      msg: correct ? "¡Muy bien!" : "Inténtalo nuevamente",
    });
  };

    const handleFeedbackDone = async () => {
    setFeedback(null);
    setSelected(null);

    if (index + 1 < colorQuestions.length) {
      setIndex(index + 1);
      return;
    }

    // Última pregunta: se registra UNA sola vez el resultado de la actividad
  const porcentaje = Math.round((correctCount / colorQuestions.length) * 100);
    if (currentStudent) {
      // Temporal: mantiene al día las asignaciones locales hasta conectarlas al back
      completeActivity(currentStudent.id, "colors" as AreaKey);
      try {
        const resultado = await registrarResultado("colors", porcentaje);
        // El progreso que manda el back reemplaza al cálculo local
        updateStudent(currentStudent.id, progresoAEstudiante(resultado.progreso));
      } catch (e) {
        // Si el back falla, el niño no se queda bloqueado
        console.error("No se pudo registrar el resultado", e);
      }
    }
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50">
      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 flex items-center gap-3 sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 transition">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-lg font-extrabold text-slate-700 flex items-center gap-2">
          🎨 Colores
        </h1>
        <span className="ml-auto text-sm font-bold text-slate-400">
          {index + 1}/{colorQuestions.length}
        </span>
      </div>

      <div className="max-w-xl mx-auto px-5 py-8 flex flex-col items-center">
        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {colorQuestions.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-pink-500" : i < index ? "w-2 bg-pink-300" : "w-2 bg-slate-200"}`}
            />
          ))}
        </div>

        {/* Emoji */}
        <div className="text-8xl mb-4 animate-bounce-slow">{question.emoji}</div>

        {/* Question */}
        <p className="text-2xl font-extrabold text-slate-700 text-center mb-2">{question.prompt}</p>
        <p className="text-slate-400 mb-8">Toca el color correcto</p>

        {/* Color options */}
        <div className="flex flex-wrap justify-center gap-4">
          {question.options.map((color) => (
            <button
              key={color}
              onClick={() => handleAnswer(color)}
              disabled={!!selected}
              className={`flex flex-col items-center gap-2 p-1 rounded-3xl transition ${
                selected === color
                  ? color === question.correctColor
                    ? "ring-4 ring-green-400 scale-105"
                    : "ring-4 ring-orange-400 scale-95"
                  : "hover:scale-105"
              } ${selected && color === question.correctColor && selected !== color ? "ring-4 ring-green-300" : ""}`}
            >
              <div
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl shadow-lg"
                style={{ backgroundColor: colorMap[color] }}
              />
              <span className="text-sm font-bold text-slate-600">{color}</span>
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
