export default function TechnologyBackground() {
  const floatingElements = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    top: (i * 1.7) % 100,
    left: (i * 3.1) % 100,
    size: 3 + (i % 4),
    delay: (i * 0.08) % 6,
    duration: 6 + (i % 8),
  }));

  const staticPulseDots = [
    { id: "a", top: "10%", left: "15%", size: 12, color: "bg-orange-300/70" },
    { id: "b", top: "28%", left: "78%", size: 10, color: "bg-amber-300/60" },
    { id: "c", top: "62%", left: "12%", size: 9, color: "bg-orange-200/70" },
    { id: "d", top: "80%", left: "70%", size: 11, color: "bg-amber-200/70" },
  ];

  const anchorDots = [
    { id: "e", top: "18%", left: "32%", size: 6 },
    { id: "f", top: "44%", left: "64%", size: 5 },
    { id: "g", top: "72%", left: "38%", size: 7 },
    { id: "h", top: "88%", left: "82%", size: 6 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,186,122,0.12), transparent 45%), radial-gradient(circle at 78% 5%, rgba(255,221,181,0.15), transparent 55%), linear-gradient(135deg, rgba(255,250,245,0.9), rgba(255,253,249,0.55))",
          backgroundColor: "#fffefc",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden opacity-45">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute rounded-full bg-gradient-to-br from-orange-300/60 to-amber-200/60 animate-float"
            style={{
              top: `${element.top}%`,
              left: `${element.left}%`,
              width: `${element.size}px`,
              height: `${element.size}px`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${element.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Static pulse dots */}
      <div className="absolute inset-0">
        {staticPulseDots.map((dot) => (
          <span
            key={dot.id}
            className={`absolute inline-flex rounded-full ${dot.color}`}
            style={{
              top: dot.top,
              left: dot.left,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
            }}
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-white/40 animate-ping" />
          </span>
        ))}
      </div>

      {/* Anchor dots for subtle poly feel */}
      <div className="absolute inset-0 opacity-70">
        {anchorDots.map((dot) => (
          <span
            key={dot.id}
            className="absolute inline-flex rounded-full bg-orange-200/45"
            style={{
              top: dot.top,
              left: dot.left,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
