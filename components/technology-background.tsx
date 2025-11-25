import { useMemo } from "react";

type FloatingOrb = {
  id: number;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
};

type AccentDot = {
  id: number;
  top: number;
  left: number;
  size: number;
  delay: number;
};

const createFloatingOrbs = (): FloatingOrb[] =>
  Array.from({ length: 36 }, (_, index) => {
    const seed = index + 1;
    return {
      id: seed,
      top: (seed * 7.5) % 100,
      left: (seed * 11.3) % 100,
      size: 120 + ((seed % 5) + 1) * 28,
      duration: 16 + (seed % 7) * 2,
      delay: (seed % 9) * 0.4,
      opacity: 0.08 + (seed % 4) * 0.03,
    };
  });

const createAccentDots = (): AccentDot[] =>
  Array.from({ length: 28 }, (_, index) => ({
    id: index + 1,
    top: (index * 12.9) % 100,
    left: (index * 9.2) % 100,
    size: 4 + (index % 3),
    delay: (index % 8) * 0.35,
  }));

export default function TechnologyBackground() {
  const floatingOrbs = useMemo(createFloatingOrbs, []);
  const accentDots = useMemo(createAccentDots, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#fffaf5]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff7ef] via-[#fff1e1] via-45% to-[#fffdf7]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,197,142,0.25)_0%,_transparent_55%)] opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,150,96,0.18)_1px,_transparent_1px)] [background-size:70px_70px] opacity-30" />

      <div className="absolute inset-0 opacity-70">
        {floatingOrbs.map((orb) => (
          <span
            key={orb.id}
            className="absolute rounded-full bg-gradient-to-br from-[#ffb07c] via-[#ffc894] to-[#ffe3c4] shadow-[0_10px_60px_rgba(255,172,112,0.25)]"
            style={{
              top: `${orb.top}%`,
              left: `${orb.left}%`,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              opacity: orb.opacity,
              animation: `float ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {accentDots.map((dot) => (
          <span
            key={dot.id}
            className="absolute inline-flex rounded-full bg-[#ff8d5b]/70"
            style={{
              top: `${dot.top}%`,
              left: `${dot.left}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              animation: `float ${10 + (dot.id % 6)}s ease-in-out ${dot.delay}s infinite`,
            }}
          >
            <span className="absolute inset-0 rounded-full bg-[#ffcaa5]/70 animate-ping" />
          </span>
        ))}
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,188,139,0.18),rgba(255,255,255,0))] opacity-70" />
    </div>
  );
}

