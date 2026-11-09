const GLOWS = [
  { top: "10%", left: "6%", size: "h-40 w-40", delay: "0s", duration: "14s" },
  { top: "18%", left: "82%", size: "h-28 w-28", delay: "1.2s", duration: "11s" },
  { top: "64%", left: "10%", size: "h-32 w-32", delay: "0.4s", duration: "13s" },
  { top: "74%", left: "84%", size: "h-44 w-44", delay: "1.8s", duration: "16s" },
];

export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,#f6d9d3_0,transparent_34%),radial-gradient(circle_at_92%_16%,#f3e4d6_0,transparent_32%),radial-gradient(circle_at_70%_100%,#f5dbe2_0,transparent_38%),#fbf3ee]" />
      {GLOWS.map((glow) => (
        <span
          key={`${glow.top}-${glow.left}`}
          className={`floaty absolute rounded-full bg-white/50 blur-2xl ${glow.size}`}
          style={{
            top: glow.top,
            left: glow.left,
            animationDelay: glow.delay,
            animationDuration: glow.duration,
          }}
        />
      ))}
    </div>
  );
}
