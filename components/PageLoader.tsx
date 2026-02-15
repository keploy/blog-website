import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import LoadingAnimation from '../lottiefiles/loading.json';
import { Skeleton } from '@heroicons/react/outline'; // Example import

const PageLoader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Simulate a 2-second delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      className="flex items-center justify-center min-h-screen"
    >
      {isLoading ? (
        // Show the skeleton loader while loading
        <Skeleton height="150px" width="150px" />
      ) : (
        // Once loading is done, show the actual content
        <Player
          autoplay
          loop
          src={LoadingAnimation}
          style={{ height: '150px', width: '150px' }}
        />
      )}
    </motion.div>
  );
};

export default PageLoader;
