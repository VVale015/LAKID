import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  type: "correct" | "incorrect";
  message: string;
  onDone: () => void;
}

export default function FeedbackBanner({ type, message, onDone }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 200);
    }, 1500);
    return () => clearTimeout(timer);
  }, [onDone]);

  const isCorrect = type === "correct";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      } ${isCorrect ? "bg-green-500/90" : "bg-orange-400/90"}`}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className={`w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-2xl ${
            visible ? "scale-100" : "scale-0"
          } transition-transform duration-300`}
        >
          {isCorrect ? (
            <Check className="w-16 h-16 text-green-500" strokeWidth={3} />
          ) : (
            <X className="w-16 h-16 text-orange-400" strokeWidth={3} />
          )}
        </div>
        <p className="text-3xl font-extrabold text-white drop-shadow-lg">{message}</p>
      </div>
    </div>
  );
}
