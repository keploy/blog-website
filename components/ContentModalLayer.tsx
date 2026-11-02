import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import type { ContentModalConfig } from "../config/content-modals";

/**
 * Renders every modal for the post in the server HTML (hidden until opened) so the
 * copy is indexable. Inline triggers are injected into the post body as
 * `[data-cm-id]` buttons; a single delegated click listener opens the matching modal.
 * Styling mirrors the landing site's FeatureModal.
 */
export default function ContentModalLayer({ modals }: { modals: ContentModalConfig[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!modals.length) return;
    const ids = new Set(modals.map((m) => m.id));
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.("[data-cm-id]") as HTMLElement | null;
      if (!el || !ids.has(el.dataset.cmId!)) return;
      e.preventDefault();
      triggerRef.current = el;
      setActiveId(el.dataset.cmId!);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [modals]);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [activeId]);

  if (!modals.length) return null;

  return (
    <>
      {modals.map((m) => (
        <ContentModal key={m.id} config={m} isOpen={activeId === m.id} onClose={() => setActiveId(null)} />
      ))}
    </>
  );
}

function ContentModal({
  config,
  isOpen,
  onClose,
}: {
  config: ContentModalConfig;
  isOpen: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = `cm-${config.id}-title`;

  // Keep Tab / Shift+Tab inside the dialog while it is open (aria-modal contract).
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Deferred: framer-motion flips `visibility` after this effect runs, and a
  // still-hidden element can't take focus.
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => closeRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [isOpen]);

  return (
    // Always mounted: closed state is `visibility: hidden` (not unmounted) so the
    // content ships in the SSR HTML. `transitionEnd` keeps the fade-out visible.
    <motion.div
      id={`cm-${config.id}`}
      initial={false}
      animate={
        isOpen
          ? { opacity: 1, visibility: "visible" }
          : { opacity: 0, transitionEnd: { visibility: "hidden" } }
      }
      style={{ visibility: "hidden", opacity: 0 }}
      onClick={onClose}
      aria-hidden={!isOpen}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-md px-4"
    >
      <motion.div
        ref={dialogRef}
        onKeyDown={onKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={false}
        animate={isOpen ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl md:max-w-3xl mx-auto max-h-[calc(100dvh-2rem)] overflow-y-auto bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 shadow-[0_24px_80px_rgba(15,23,42,0.45)] border border-orange-100/60"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          tabIndex={isOpen ? 0 : -1}
          className="absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-gray-500 hover:text-gray-800 shadow-sm hover:shadow-md transition-all"
        >
          <XIcon className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="space-y-5 md:space-y-6">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 pr-10">
            <h2
              id={titleId}
              className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-[#FF914D] to-amber-500"
            >
              {config.title}
            </h2>
            {config.tag && (
              <span className="text-xs md:text-sm border font-medium border-black/[0.08] rounded-full text-black/70 px-2.5 py-0.5 bg-white/70 backdrop-blur">
                {config.tag}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {config.image && (
              <img
                src={config.image.src}
                alt={config.image.alt}
                width={config.image.width}
                height={config.image.height}
                loading="lazy"
                className="w-full h-auto rounded-xl border border-orange-100/60"
              />
            )}
            {config.body.map((p, i) => (
              <p key={i} className="text-sm md:text-base leading-relaxed text-gray-700">
                {p}
              </p>
            ))}
            {config.bullets?.length ? (
              <ul className="list-disc pl-5 space-y-1.5 text-sm md:text-base leading-relaxed text-gray-700">
                {config.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            ) : null}
          </div>

          {config.ctas?.length ? (
            <div className="flex flex-wrap gap-3 pt-1">
              {config.ctas.map((cta) => (
                <a
                  key={cta.href}
                  href={cta.href}
                  tabIndex={isOpen ? 0 : -1}
                  className={
                    cta.variant === "secondary"
                      ? "inline-flex items-center rounded-full border border-orange-300 bg-white/80 px-5 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
                      : "inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:brightness-105 transition-all"
                  }
                >
                  {cta.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
