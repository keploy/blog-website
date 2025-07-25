"use client";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  className,
}: {
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  className?: string;
}) => {
  const noise = createNoise3D();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const waveColors = colors ?? [
    "#fdba74",
    "#fb923c",
    "#f97316",
    "#facc15",
    "#fcd34d",
  ];

  const getSpeed = () => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  };

  const init = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.filter = `blur(${blur}px)`;

    const w = window.innerWidth;
    const h = window.innerHeight;
    let nt = 0;

    const drawWave = (n: number) => {
      nt += getSpeed();
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth || 50;
        ctx.strokeStyle = waveColors[i % waveColors.length];

        for (let x = -w; x < w * 2; x += 5) {
          const y = noise(x / 800, 0.3 * i, nt) * 100;
          ctx.lineTo(x, y + h * 0.5);
        }

        ctx.stroke();
        ctx.closePath();
      }
    };

    const render = () => {
      ctx.save();
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = backgroundFill || "#FBFCFF";
      ctx.globalAlpha = waveOpacity;
      ctx.fillRect(0, 0, w, h);

      ctx.translate(w / 2, h / 2);
      ctx.rotate((-15 * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);

      drawWave(5);
      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    window.addEventListener("resize", init);
  };

  let animationId: number;

  useEffect(() => {
    init();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", init);
    };
  }, []);

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="canvas"
      className={classNames(
        "absolute inset-0 z-0 pointer-events-none",
        "lg:-top-20 xl:-top-40",
        className
      )}
      style={{
        ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        backgroundColor: backgroundFill || "#FBFCFF",
      }}
    />
  );
};
