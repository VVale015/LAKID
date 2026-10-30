interface Props {
  value: number;
  color?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function ProgressBar({ value, color = "from-sky-400 to-indigo-400", size = "md", showLabel = false }: Props) {
  const heights = { sm: "h-2", md: "h-3.5", lg: "h-5" };
  return (
    <div className="w-full">
      <div className={`w-full ${heights[size]} bg-slate-200 rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-right text-sm font-bold text-slate-600 mt-1">{value}%</div>
      )}
    </div>
  );
}
