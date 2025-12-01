export default function TechnologyBackground() {
  // Match the floating background behavior from the reference code
  const floatingElements = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    top: (i * 2.5) % 100,
    left: (i * 2.5) % 100,
    size: 2 + (i % 3),
    delay: (i * 0.1) % 5,
    duration: 5 + (i % 10),
  }));

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-background to-amber-50 pointer-events-none -z-10 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-60">
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute rounded-full bg-gradient-to-br from-orange-300/80 via-orange-400/70 to-amber-300/80 animate-float"
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
    </div>
  );
}
