import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();
  const category = router.asPath.split("/")[1];

  useEffect(() => {
    if (category === "community") {
      router.replace("/technology");
    } else if (category === "technology") {
      router.replace("/community");
    } else {
      router.replace("/");
    }
  }, [category, router]);

  return null;
}
