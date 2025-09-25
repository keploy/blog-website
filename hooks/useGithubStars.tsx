import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export function useGithubStars(initialStars = "10.2K") {
  const [stars, setStars] = useState(initialStars);
  const { basePath } = useRouter();

  useEffect(() => {
    const url = `${basePath}/api/github-stars`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const count = data.stars ?? data.stargazers_count;
        const formattedCount =
          count >= 1000
            ? `${(count / 1000).toFixed(1).replace(".0", "")}K`
            : count.toString();
        setStars(formattedCount);
      })
      .catch(() => {});
  }, [basePath]);

  return stars;
}
