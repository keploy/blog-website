import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { KeywordTooltipConfig } from "../config/keyword-tooltips";

interface ActiveTooltip {
  config: KeywordTooltipConfig;
  rect: DOMRect;
}

export default function KeywordTooltipLayer({ tooltips }: { tooltips: KeywordTooltipConfig[] }) {
  const [active, setActive] = useState<ActiveTooltip | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!tooltips.length) return;

    const map = new Map(tooltips.map((t) => [t.key, t]));
    let closeTimer: ReturnType<typeof setTimeout> | null = null;

    const cancelClose = () => {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Entering the panel — cancel any pending close, stay open
      if (target.closest?.("[data-tt-panel]")) {
        cancelClose();
        return;
      }

      // Entering a keyword span — show tooltip immediately, no auto-close
      const el = target.closest("[data-tt-key]") as HTMLElement | null;
      if (!el) return;
      const config = map.get(el.dataset.ttKey!);
      if (!config) return;

      cancelClose();
      setActive({ config, rect: el.getBoundingClientRect() });
    };

    const onOut = (e: MouseEvent) => {
      const from = e.target as HTMLElement;
      const to = e.relatedTarget as HTMLElement | null;

      const leavingKeyword = !!from.closest?.("[data-tt-key]");
      const leavingPanel = !!from.closest?.("[data-tt-panel]");
      const goingToPanel = !!to?.closest?.("[data-tt-panel]");
      const goingToKeyword = !!to?.closest?.("[data-tt-key]");

      // Close only when leaving both the keyword and the panel.
      // 100ms buffer lets the mouse cross the gap between keyword and panel
      // without the tooltip blinking out.
      if ((leavingKeyword || leavingPanel) && !goingToPanel && !goingToKeyword) {
        cancelClose();
        closeTimer = setTimeout(() => setActive(null), 100);
      }
    };

    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [tooltips]);

  if (!mounted || !active) return null;

  const { config, rect } = active;

  return createPortal(
    <div
      data-tt-panel
      style={{
        position: "fixed",
        top: rect.top,
        left: rect.left + rect.width / 2,
        transform: "translate(-50%, calc(-100% - 10px))",
        zIndex: 9999,
        width: 240,
        background: "white",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)",
        border: "1px solid rgba(0,0,0,0.08)",
        overflow: "visible",
        pointerEvents: "auto",
      }}
    >
      {/* downward arrow */}
      <div
        style={{
          position: "absolute",
          bottom: -6,
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          width: 12,
          height: 12,
          background: "white",
          borderRight: "1px solid rgba(0,0,0,0.08)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      />

      <div style={{ borderRadius: 12, overflow: "hidden" }}>
        {/* media */}
        {config.media.type === "video" ? (
          <video
            src={config.media.src}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", display: "block", maxHeight: 140, objectFit: "cover" }}
          />
        ) : (
          <img
            src={config.media.src}
            alt={config.media.alt ?? ""}
            style={{ width: "100%", display: "block", maxHeight: 140, objectFit: "cover" }}
          />
        )}

        {/* text + cta */}
        <div style={{ padding: "10px 12px 12px" }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 13,
              fontWeight: 600,
              color: "#111",
              lineHeight: 1.4,
            }}
          >
            {config.heading}
          </p>
          <a
            href={config.ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              textAlign: "center",
              padding: "6px 12px",
              background: "#f97316",
              color: "white",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {config.ctaText}
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}
