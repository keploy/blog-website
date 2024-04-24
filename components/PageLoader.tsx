import { motion } from "framer-motion";
import { Player, Controls } from "@lottiefiles/react-lottie-player";
import LoadingAnimation from "../lottiefiles/loading.json";

const PageLoader = () => {
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
      className="flex items-center justify-center min-h-screen"
    >
      <Player
        autoplay
        loop
        src={LoadingAnimation}
        style={{ height: "150px", width: "150px" }}
      />
    </motion.div>
  );
};
export default PageLoader;
