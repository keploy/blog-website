import { useEffect } from "react";
import { useRouter } from "next/router";
import NotFoundPage from "../components/NotFoundPage";

export default function Custom404() {

  const router = useRouter();
  const category = router.asPath.split("/")[1];

  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      if (category === "community") {
        router.replace("/technology");
      } else if (category === "technology") {
        router.replace("/community");
      } else {
        router.replace("/");
      } 
    }, );

    return () => clearTimeout(redirectTimeout);
  }, [category, router]);

  return <NotFoundPage />;
}
