import Link from "next/link";
import type { GatedReportConfig } from "../config/gated-reports";

export default function GatedReport({ config }: { config: GatedReportConfig }) {
  return (
    <div
      className="my-10 rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
      style={{ height: "520px" }}
    >
      <style>{`
        .gr-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="gr-scroll h-full overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Report preview image */}
        <img
          src={config.preview.imageSrc}
          alt={config.preview.alt}
          className="w-full block"
          loading="lazy"
        />

        {/*
          Overlay sits 220px up into the image via negative margin.
          backdrop-filter blurs the image visible behind it.
          mask-image fades the whole overlay in gradually so there's no hard edge.
        */}
        <div
          style={{
            marginTop: "-220px",
            paddingTop: "88px",
            paddingBottom: "32px",
            paddingLeft: "24px",
            paddingRight: "24px",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.78) 38%, rgba(255,255,255,0.96) 65%, white 85%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 38%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 38%)",
            textAlign: "center",
          }}
        >
          <p className="text-sm font-bold text-gray-900 mt-0 mb-1">{config.title}</p>
          <p className="text-gray-500 text-xs mb-3 mt-0">{config.subtitle}</p>
          <Link
            href={config.redirectUrl}
            className="inline-block px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap"
          >
            {config.ctaText || "Read Full Blog →"}
          </Link>
        </div>
      </div>
    </div>
  );
}
