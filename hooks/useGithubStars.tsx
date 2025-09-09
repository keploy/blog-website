import { useEffect, useState } from "react";

export function useGithubStars(initialStars = "10.2K") {
  const [stars, setStars] = useState(initialStars);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Only run on client side
    
    fetch("https://api.github.com/repos/keploy/keploy")
      .then((response) => response.json())
      .then((data) => {
        const count = data.stargazers_count;
        const formattedCount =
          count >= 1000
            ? `${(count / 1000).toFixed(1).replace(".0", "")}K`
            : count.toString();
        setStars(formattedCount);
      })
      .catch((error) => {
        console.log("Failed to fetch GitHub stars:", error);
        // Keep the initial value on error
      });
  }, [isClient]);

  return stars;
}
