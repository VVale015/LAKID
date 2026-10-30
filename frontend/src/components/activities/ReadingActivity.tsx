import { useState, useEffect } from "react";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { readingStories } from "@/data";
import FeedbackBanner from "@/components/FeedbackBanner";
import { useApp } from "@/store";
import type { AreaKey } from "@/types";

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

function speak(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  }
}

export default function ReadingActivity({ onBack, onComplete }: Props) {
  const { currentStudent, completeActivity } = useApp();
  const [storyIndex, setStoryIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<"reading" | "questions">("reading");
  const [feedback, setFeedback] = useState<{ type: "correct" | "incorrect"; msg: string } | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const story = readingStories[storyIndex];
  const question = story.questions[questionIndex];

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      speak(story.text);
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), story.text.length * 60);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    const correct = optionIndex === question.answer;
    setFeedback({
      type: correct ? "correct" : "incorrect",
      msg: correct ? "¡Muy bien!" : "Inténtalo nuevamente",
    });
  };

  const handleFeedbackDone = () => {
    setFeedback(null);
    setSelected(null);
    if (questionIndex + 1 < story.questions.length) {
      setQuestionIndex(questionIndex + 1);
    } else if (storyIndex + 1 < readingStories.length) {
      if (currentStudent) completeActivity(currentStudent.id, "reading" as AreaKey);
      setStoryIndex(storyIndex + 1);
      setQuestionIndex(0);
      setPhase("reading");
    } else {
      if (currentStudent) completeActivity(currentStudent.id, "reading" as AreaKey);
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="bg-white/80 backdrop-blur-sm px-5 py-4 flex items-center gap-3 sticky top-0 z-10 border-b border-slate-100">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 transition">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-lg font-extrabold text-slate-700 flex items-center gap-2">
          📖 Lecturas
        </h1>
        <span className="ml-auto text-sm font-bold text-slate-400">
          {storyIndex + 1}/{readingStories.length}
        </span>
      </div>

      <div className="max-w-xl mx-auto px-5 py-6">
        {phase === "reading" ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            {/* Story image */}
            <div className="relative rounded-2xl overflow-hidden mb-4 h-48">
              <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <span className="text-3xl">{story.emoji}</span>
                <h2 className="text-xl font-extrabold drop-shadow">{story.title}</h2>
              </div>
            </div>

            {/* Story text */}
            <p className="text-slate-600 leading-relaxed text-lg mb-4">{story.text}</p>

            {/* Audio button */}
            <button
              onClick={toggleAudio}
              className="w-full py-3 bg-amber-100 text-amber-600 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-200 transition mb-4"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? "Detener audio" : "Escuchar cuento"}
            </button>

            <button
              onClick={() => setPhase("questions")}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition"
            >
              Responder preguntas
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex gap-2 mb-4">
              {story.questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${i === questionIndex ? "w-8 bg-amber-500" : i < questionIndex ? "w-2 bg-amber-300" : "w-2 bg-slate-200"}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-4xl">{story.emoji}</span>
              <span className="text-sm font-bold text-slate-400">{story.title}</span>
            </div>

            <p className="text-xl font-extrabold text-slate-700 mb-6">{question.question}</p>

            <div className="space-y-3">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                  className={`w-full py-4 px-5 rounded-2xl border-2 font-bold text-lg transition text-left ${
                    selected === i
                      ? i === question.answer
                        ? "border-green-400 bg-green-50 text-green-600"
                        : "border-orange-400 bg-orange-50 text-orange-500"
                      : selected !== null && i === question.answer
                        ? "border-green-300 bg-green-50 text-green-500"
                        : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
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
