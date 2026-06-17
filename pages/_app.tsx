import { AppProps } from 'next/app';
import '../styles/index.css';
import Router from "next/router";
import Script from 'next/script';

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic'
import { trackAiReferral } from '@/utils/aiReferralTracker';
import { Announcements } from '../components/Announcements';

const PageLoader = dynamic(() => import('../components/PageLoader'), {
  ssr: false,
})

function MyApp({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Used for page transition
    const startLoader = () => {
      setLoading(true);
    };
    const stopLoader = () => {
      setLoading(false);
    };
    Router.events.on("routeChangeStart", startLoader);
    Router.events.on("routeChangeComplete", stopLoader);
    Router.events.on("routeChangeError", stopLoader);
    return () => {
      Router.events.off("routeChangeStart", startLoader);
      Router.events.off("routeChangeComplete", stopLoader);
      Router.events.off("routeChangeError", stopLoader);
    };
  }, []);

  useEffect(() => {
    // Track AI referral only on initial landing — document.referrer
    // doesn't change on SPA navigations, so re-firing would duplicate events.
    trackAiReferral();
  }, []);

  return (
    <>
      <Script
        id="keploy-telemetry-sdk"
        src="https://telemetry.keploy.io/sessions/sdk.js"
        data-endpoint="https://telemetry.keploy.io/sessions/collect"
        data-source="blog"
        strategy="lazyOnload"
      />
      <Announcements />
      {loading ? <PageLoader /> : <Component {...pageProps} />}
    </>
  );
}

export default MyApp
