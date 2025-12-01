import { useState, useEffect, useCallback } from "react";

// Constants
const CIRCLE_RADIUS = 15.92;
const SCROLL_THRESHOLD = 300;
const THROTTLE_DELAY = 16; // ~60fps

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Throttle function to limit scroll event frequency
  const throttle = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;

    return (...args: any[]) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }, []);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > SCROLL_THRESHOLD) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const updateScrollProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
    };

    const handleScroll = () => {
      toggleVisibility();
      updateScrollProgress();
    };

    // Throttled scroll handler
    const throttledScrollHandler = throttle(handleScroll, THROTTLE_DELAY);

    window.addEventListener("scroll", throttledScrollHandler);
    return () => window.removeEventListener("scroll", throttledScrollHandler);
  }, [throttle]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const circumference = 2 * Math.PI * CIRCLE_RADIUS;
  const strokeDashoffset =
    circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      className={`fixed right-5 bottom-5 w-12 h-12 rounded-full cursor-pointer z-50 flex items-center justify-center transition-all duration-500 ease-out ${
        isVisible
          ? "opacity-100 scale-100 visible"
          : "opacity-0 scale-0 invisible"
      } hover:opacity-80 hover:scale-110`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <svg viewBox="0 0 34 34" className="w-full h-full transform -rotate-90">
        <defs>
          <linearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>
        <circle
          className="fill-white stroke-gray-300 opacity-90 dark:fill-gray-800 dark:stroke-gray-600"
          cx="17"
          cy="17"
          r={CIRCLE_RADIUS}
          strokeWidth="1.5"
        />
        <circle
          className="fill-none"
          cx="17"
          cy="17"
          r={CIRCLE_RADIUS}
          strokeWidth="1.5"
          strokeLinecap="round"
          stroke="url(#progressGradient)"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 50ms ease-out" }}
        />
        <path
          className="fill-none stroke-gray-800 dark:stroke-white"
          d="M15.07,21.06,19.16,17l-4.09-4.06"
          strokeWidth="1.5"
        />
      </svg>
    </button>
  );
};

export default ScrollToTop;
