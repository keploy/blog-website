export default function Keploy5YearsCard() {
  return (
    <div style={{ marginTop: 16, width: "100%", maxWidth: 320 }}>
      <style>{`
        @keyframes k5y-border {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes k5y-glow {
          0%, 100% { box-shadow: 0 2px 16px rgba(0,0,0,0.06), 0 0 0 0 rgba(251,176,45,0); }
          50%       { box-shadow: 0 2px 16px rgba(44, 28, 28, 0.06), 0 0 18px 3px rgba(251,176,45,0.18); }
        }
        @keyframes k5y-sweep {
          0%        { transform: translateX(-120%) skewX(-12deg); }
          60%, 100% { transform: translateX(300%) skewX(-12deg); }
        }
        @keyframes k5y-sparkle {
          0%, 100% { opacity: 0.55; transform: scale(1) rotate(0deg); }
          50%       { opacity: 1;    transform: scale(1.25) rotate(18deg); }
        }
      `}</style>

      {/* Animated gradient border */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #fbbf24, #f97316, #f59e0b, #fb923c, #fde68a, #f97316, #fbbf24)",
          backgroundSize: "400% 400%",
          animation: "k5y-border 4.5s ease infinite, k5y-glow 3s ease-in-out infinite",
          padding: "1.5px",
          borderRadius: 18,
        }}
      >
        {/* Card body */}
        <div
          style={{
            background: "#fffcf7",
            borderRadius: "calc(18px - 1.5px)",
            padding: "22px 20px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Diagonal shine sweep */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "55%",
              height: "100%",
              background:
                "linear-gradient(105deg, transparent 38%, rgba(251,191,36,0.07) 50%, transparent 62%)",
              animation: "k5y-sweep 3.8s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Sparkle + badge row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span
              style={{
                fontSize: 15,
                color: "#f59e0b",
                display: "inline-block",
                animation: "k5y-sparkle 2.5s ease-in-out infinite",
                lineHeight: 1,
              }}
            >
              ✦
            </span>
            <span
              style={{
                background: "linear-gradient(90deg, #f59e0b, #f97316)",
                borderRadius: 20,
                padding: "3px 10px",
                fontSize: 10,
                fontWeight: 700,
                color: "white",
                letterSpacing: "0.09em",
                textTransform: "uppercase" as const,
              }}
            >
              5 Years ✨
            </span>
          </div>

          {/* Heading */}
          <p
            style={{
              color: "#1c0f00",
              fontSize: 13,
              fontWeight: 700,
              margin: "0 0 10px",
              lineHeight: 1.38,
            }}
          >
            Keploy has completed it's 5 years this month!
          </p>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "linear-gradient(90deg, #fde68a, #fed7aa, transparent)",
              marginBottom: 12,
              borderRadius: 1,
            }}
          />

          {/* Body */}
          <p
            style={{
              color: "#92400e",
              fontSize: 12.5,
              margin: "0 0 22px",
              lineHeight: 1.7,
            }}
          >
            To celebrate, we are giving away free Keploy credits for a month!
          </p>

          {/* CTA */}
          <a
            href="https://app.keploy.io/signin"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textAlign: "center",
              padding: "10px 16px",
              background: "linear-gradient(90deg, #f59e0b, #f97316)",
              color: "white",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 3px 14px rgba(249,115,22,0.32)",
              letterSpacing: "0.02em",
            }}
          >
            Get 1 Month of Keploy Credits Free
          </a>
        </div>
      </div>
    </div>
  );
}
