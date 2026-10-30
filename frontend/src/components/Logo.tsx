export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center bg-gradient-to-br from-sky-400 to-indigo-400 rounded-2xl shadow-lg"
        style={{ width: size === "lg" ? 80 : size === "sm" ? 40 : 56, height: size === "lg" ? 80 : size === "sm" ? 40 : 56 }}>
        <span style={{ fontSize: size === "lg" ? 40 : size === "sm" ? 20 : 28 }}>🧩</span>
      </div>
      <span className={`font-extrabold ${sizes[size]} bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent tracking-tight`}>
        LAKID
      </span>
    </div>
  );
}
