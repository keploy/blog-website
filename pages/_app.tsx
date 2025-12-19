import { AppProps } from "next/app";
import "../styles/index.css";
import Router from "next/router";

import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <AnimatePresence>
        <Component {...pageProps} />
      </AnimatePresence>
    </>
  );
}

export default MyApp;
