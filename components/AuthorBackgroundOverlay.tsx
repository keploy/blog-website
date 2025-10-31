import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

interface AuthorBackgroundOverlayProps {
  authors: string[];
}

// Seeded random number generator for deterministic placement
class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
}

interface AvatarPosition {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  imageIndex: number;
}

const AuthorBackgroundOverlay: React.FC<AuthorBackgroundOverlayProps> = ({ authors }) => {
  // Helper function to validate image URLs
  const isValidImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    
    // Check for valid URL patterns
    const validPatterns = [
      /^https?:\/\//,  // http:// or https://
      /^\/[^\/]/,      // starts with / (absolute path)
      /\.(jpg|jpeg|png|webp|gif|svg)$/i  // has image extension
    ];
    
    return validPatterns.some(pattern => pattern.test(url));
  };

  // Filter to only include authors with valid images and ensure uniqueness
  const validAuthors = useMemo(() => {
    const validImages = authors.filter(author => isValidImageUrl(author));
    // Remove duplicates by creating a Set of unique URLs
    const uniqueImages = Array.from(new Set(validImages));
    return uniqueImages;
  }, [authors]);

  // Client-only random seed so layout changes on refresh without SSR mismatch
  const [seed, setSeed] = useState<number>(12345);
  useEffect(() => {
    setSeed(Math.floor(Math.random() * 1_000_000_007));
  }, []);

  // Shuffle helper using seeded RNG (Fisher–Yates)
  const shuffleWithSeed = (arr: string[], rng: SeededRNG): string[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const avatarPositions = useMemo(() => {
    if (!validAuthors.length) return [];

    // Use client-provided seed so arrangement changes per refresh
    const rng = new SeededRNG(seed);
    // Shuffle authors so the same image can appear in different spots per refresh
    const authorsShuffled = shuffleWithSeed(validAuthors, rng);
    const positions: AvatarPosition[] = [];
    // Target total avatars: 20–24 (cap by available unique images)
    const countRng = new SeededRNG(seed + 7);
    const targetCount = countRng.nextInt(20, 24);
    const maxAvatars = Math.min(targetCount, authorsShuffled.length);
    
    // Define left and right side zones
    const leftZone = { xMin: 3, xMax: 30 };   // Wider left side
    const rightZone = { xMin: 70, xMax: 97 }; // Wider right side
    // Vertical bands
    const yMin = 5;
    const yMax = 95;
    const yTopMax = 40;      // Top band
    const yBottomMin = 60;   // Bottom band
    const topBandProbability = 0.5;   // 50% top
    const bottomBandProbability = 0.5; // 50% bottom

    // Helper function to check if a position overlaps with existing positions
    const checkOverlap = (newPos: AvatarPosition, existingPositions: AvatarPosition[]): boolean => {
      // Stricter size-aware spacing (percentage units) to guarantee no overlap
      const minDistance = 18 + newPos.size * 0.10;
      
      return existingPositions.some(existing => {
        const distance = Math.sqrt(
          Math.pow(newPos.x - existing.x, 2) + Math.pow(newPos.y - existing.y, 2)
        );
        return distance < minDistance;
      });
    };

    // Forbidden zones for heading and subtitle (percentages)
    // Slightly larger forbidden zones around heading/subtitle to minimize proximity
    const headingZone = { top: 10, bottom: 34, left: 16, right: 84 };
    const subtitleZone = { top: 26, bottom: 48, left: 14, right: 86 };
    const isInForbiddenZone = (xPct: number, yPct: number): boolean => {
      const inHeading =
        yPct >= headingZone.top && yPct <= headingZone.bottom &&
        xPct >= headingZone.left && xPct <= headingZone.right;
      const inSubtitle =
        yPct >= subtitleZone.top && yPct <= subtitleZone.bottom &&
        xPct >= subtitleZone.left && xPct <= subtitleZone.right;
      return inHeading || inSubtitle;
    };

    // Distribute avatars evenly between left and right sides
    const leftCount = Math.ceil(maxAvatars / 2);
    const rightCount = maxAvatars - leftCount;

    // Place left side avatars
    for (let i = 0; i < leftCount; i++) {
      let attempts = 0;
      let position: AvatarPosition | null = null;
      
      do {
        const x = rng.nextFloat(leftZone.xMin, leftZone.xMax);
        // Choose top or bottom band, with allowance for full band if neither selected
        const roll = rng.next();
        const y = roll < topBandProbability
          ? rng.nextFloat(yMin, yTopMax)
          : (roll < topBandProbability + bottomBandProbability
              ? rng.nextFloat(yBottomMin, yMax)
              : rng.nextFloat(yMin, yMax));
        
        const candidate: AvatarPosition = {
          x,
          y,
          size: rng.nextInt(50, 70),
          duration: 0,
          delay: 0,
          imageIndex: i % authorsShuffled.length
        };
        
        attempts++;
        if (!isInForbiddenZone(candidate.x, candidate.y) && !checkOverlap(candidate, positions)) {
          position = candidate;
          break;
        }
      } while (attempts < 200);
      
      if (position) positions.push(position);
    }

    // Place right side avatars
    for (let i = 0; i < rightCount; i++) {
      let attempts = 0;
      let position: AvatarPosition | null = null;
      
      do {
        const x = rng.nextFloat(rightZone.xMin, rightZone.xMax);
        const roll = rng.next();
        const y = roll < topBandProbability
          ? rng.nextFloat(yMin, yTopMax)
          : (roll < topBandProbability + bottomBandProbability
              ? rng.nextFloat(yBottomMin, yMax)
              : rng.nextFloat(yMin, yMax));
        
        const candidate: AvatarPosition = {
          x,
          y,
          size: rng.nextInt(50, 70),
          duration: 0,
          delay: 0,
          imageIndex: (leftCount + i) % authorsShuffled.length
        };
        
        attempts++;
        if (!isInForbiddenZone(candidate.x, candidate.y) && !checkOverlap(candidate, positions)) {
          position = candidate;
          break;
        }
      } while (attempts < 200);
      
      if (position) positions.push(position);
    }

    return positions;
  }, [validAuthors, seed]);

  return (
    <>
      <style jsx>{`
        .center-mask {
          background: radial-gradient(
            circle at center,
            rgba(255, 255, 255, 0.25) 0%,
            rgba(255, 255, 255, 0.1) 30%,
            transparent 70%
          );
        }
      `}</style>
      
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Center radial mask gradient */}
        <div className="absolute inset-0 center-mask" />
        
        {/* Static avatars */}
        {avatarPositions.map((avatar, index) => {
          // Use the same shuffle logic to obtain consistent mapping for this render
          const rngForRender = new SeededRNG(seed);
          const authorsShuffled = shuffleWithSeed(validAuthors, rngForRender);
          const authorImage = authorsShuffled[avatar.imageIndex];
          
          return (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${avatar.x}%`,
                top: `${avatar.y}%`,
                transform: 'translate(-50%, -50%)'
              } as React.CSSProperties}
            >
              <Image
                src={authorImage}
                alt=""
                width={avatar.size}
                height={avatar.size}
                className="rounded-full border-2 border-white shadow-lg"
                style={{
                  width: `${avatar.size}px`,
                  height: `${avatar.size}px`,
                  objectFit: 'cover'
                }}
                role="presentation"
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default AuthorBackgroundOverlay;
