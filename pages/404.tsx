import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NotFoundPage from "../components/NotFoundPage";

export default function Custom404({ redirectPath }) {
  const router = useRouter();

  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      router.replace(redirectPath || "/");
    }, 3000);

    return () => clearTimeout(redirectTimeout);
  }, [router, redirectPath]);

  return (
    <>
      <Head>
        <title>404 - Page Not Found | Keploy Blog</title>
      </Head>
      <NotFoundPage />
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p>You will be redirected shortly...</p>
      </div>
    </>
  );
}

export const getServerSideProps = ({ req, resolvedUrl }) => {
  let redirectPath = "/";
  if (resolvedUrl.startsWith("/community/")) {
    redirectPath = "/community";
  } else if (resolvedUrl.startsWith("/technology/")) {
    redirectPath = "/technology";
  }

  return {
    props: {
      redirectPath,
    },
  };
};
