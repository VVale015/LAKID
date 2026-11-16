// frontend/src/components/activities/GamesActivity.tsx

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { memoryCards } from "@/data";
import FeedbackBanner from "@/components/FeedbackBanner";
import { useApp } from "@/store";
import type { AreaKey } from "@/types";
import { registrarResultado, progresoAEstudiante } from "@/services/resultados";

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

interface CardState {
  id: number;
  emoji: string;
  label: string;
  flipped: boolean;
  matched: boolean;
}

function shuffleCards(): CardState[] {
  const pairs = [...memoryCards, ...memoryCards];
  return pairs
    .map((c) => ({
      id: c.id + Math.random() * 1000,
      emoji: c.emoji,
      label: c.label,
      flipped: false,
      matched: false,
    }))
    .sort(() => Math.random() - 0.5)
    .map((c, i) => ({ ...c, id: i }));
}

export default function GamesActivity({ onBack, onComplete }: Props) {
  const { currentStudent, completeActivity, updateStudent } = useApp();
  const registrado = useRef(false);
  const [cards, setCards] = useState<CardState[]>(shuffleCards);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; msg: string } | null>(null);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      setMoves((m) => m + 1);
      if (cards[a].emoji === cards[b].emoji) {
        setCards((prev) =>
          prev.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))
        );
        setFeedback({ type: "correct", msg: "¡Encontraste una pareja!" });
        setFlipped([]);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c))
          );
          setFlipped([]);
        }, 900);
      }
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      setWon(true);
      // La bandera evita enviar el resultado más de una vez por partida
      if (currentStudent && !registrado.current) {
        registrado.current = true;
        // Temporal: mantiene al día las asignaciones locales hasta conectarlas al back
        completeActivity(currentStudent.id, "games" as AreaKey);
        registrarResultado("games", 100)
          .then((r) => updateStudent(currentStudent.id, progresoAEstudiante(r.progreso)))
          .catch((e) => console.error("No se pudo registrar el resultado", e));
      }
    }
  }, [cards, currentStudent]);

  const handleClick = (index: number) => {
    if (flipped.length === 2 || cards[index].flipped || cards[index].matched) return;
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, flipped: true } : c)));
    setFlipped((prev) => [...prev, index]);
  };

  const handleReset = () => {
    setCards(shuffleCards());
    setFlipped([]);
    setMoves(0);
    setWon(false);
    registrado.current = false;
  };

  const handleFeedbackDone = () => {
    setFeedback(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50">
      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 flex items-center gap-3 sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 transition">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-lg font-extrabold text-slate-700 flex items-center gap-2">
          🎮 Juego de Memoria
        </h1>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400">Movimientos: {moves}</span>
          <button
            onClick={handleReset}
            className="p-2 rounded-full hover:bg-slate-100 transition"
          >
            <RefreshCw className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        <p className="text-center text-slate-400 mb-6">
          Encuentra todas las parejas de frutas y verduras
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {cards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => handleClick(i)}
              disabled={card.matched || card.flipped}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                card.flipped || card.matched
                  ? "bg-white shadow-md"
                  : "bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg hover:scale-105"
              } ${card.matched ? "opacity-50" : ""}`}
            >
              {card.flipped || card.matched ? (
                <>
                  <span className="text-4xl">{card.emoji}</span>
                  <span className="text-xs font-bold text-slate-500">{card.label}</span>
                </>
              ) : (
                <span className="text-3xl">❓</span>
              )}
            </button>
          ))}
        </div>

        {won && (
          <div className="mt-8 bg-white rounded-3xl p-6 text-center shadow-sm">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-2xl font-extrabold text-slate-700 mb-2">¡Lo lograste!</h2>
            <p className="text-slate-400 mb-4">Completaste el juego en {moves} movimientos</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Jugar de nuevo
              </button>
              <button
                onClick={onComplete}
                className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </div>

      {feedback && (
        <FeedbackBanner type={feedback.type} message={feedback.msg} onDone={handleFeedbackDone} />
      )}
    </div>
  );
}
