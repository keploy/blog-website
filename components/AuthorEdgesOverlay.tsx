import Image from 'next/image';
import { useRef } from 'react';

type AuthorEdgesOverlayProps = {
  images: string[];
};

export default function AuthorEdgesOverlay({ images }: AuthorEdgesOverlayProps) {
  const isValidSrc = (src: string) => {
    if (!src) return false;
    const trimmed = src.trim().toLowerCase();
    if (trimmed === 'image' || trimmed === 'imag1') return false;
    return /^https?:\/\//.test(src) || /^\//.test(src);
  };

  const chosenRef = useRef<string[] | null>(null);
  if (chosenRef.current === null) {
    const unique = Array.from(new Set(images.filter(isValidSrc)));
    const desired = Math.min(unique.length, 7 + Math.floor(Math.random() * 3)); // 7–9
    const shuffledOnce = [...unique].sort(() => Math.random() - 0.5).slice(0, desired);
    chosenRef.current = shuffledOnce;
  }
  const shuffled = chosenRef.current as string[];

  const positions: Array<React.CSSProperties> = [
    // Left edge cluster (varied Y)
    { left: '5%', top: '12%' },
    { left: '7%', top: '26%' },
    { left: '9%', bottom: '24%' },
    { left: '6%', bottom: '14%' },
    // Right edge cluster
    { right: '6%', top: '18%' },
    { right: '8%', top: '30%' },
    { right: '7%', bottom: '20%' },
    { right: '10%', bottom: '12%' },
    // Upper/lower corners but off-center
    { left: '12%', top: '34%' },
    { right: '12%', bottom: '26%' },
    { left: '10%', bottom: '10%' },
    { right: '9%', top: '12%' },
  ];

  const ringClasses = [
    'ring-orange-200/60',
    'ring-amber-200/60',
    'ring-orange-300/50',
  ];

  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      {shuffled.map((src, i) => {
        const rotation = (i % 2 === 0 ? 1 : -1) * (2 + (i % 3)); // ~2–4deg alternating
        const ring = ringClasses[i % ringClasses.length];
        return (
          <div key={`${src}-${i}`} className="absolute" style={positions[i % positions.length]}>
            <div style={{ transform: `rotate(${rotation}deg)` }}>
              <div
                className={`rounded-full ring-2 ${ring} border border-white/80 shadow-[0_2px_4px_rgba(0,0,0,0.1)] overflow-hidden animate-[floatTiny_7s_ease-in-out_infinite]`}
                style={{ width: 56, height: 56, opacity: 0.75 }}
              >
                <Image src={src} alt="" width={56} height={56} className="object-cover" />
              </div>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes floatTiny {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-1px); }
        }
      `}</style>
    </div>
  );
}


