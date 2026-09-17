import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import LoadingAnimation from "../lottiefiles/loading.json";

export interface PageLoaderProps {
  className?: string;
  size?: number | string;
  ariaLabel?: string;
}

const PageLoader = ({
  className,
  size = 150,
  ariaLabel = "Loading page content",
}: PageLoaderProps = {}) => {
  const dimension = typeof size === "number" ? `${size}px` : size;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      className={`flex items-center justify-center min-h-screen${className ? ` ${className}` : ""}`}
      role="status"
      aria-label={ariaLabel}
    >
      <Player
        autoplay
        loop
        src={LoadingAnimation}
        style={{ height: dimension, width: dimension }}
      />
    </motion.div>
  );
};

export default PageLoader;
