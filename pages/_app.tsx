import { AppProps } from 'next/app';
import { Baloo_2, DM_Sans, Lexend } from 'next/font/google';
import '../styles/index.css';
import Router from "next/router";
import Script from 'next/script';

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic'
import { trackAiReferral } from '@/utils/aiReferralTracker';
import { Announcements } from '../components/Announcements';

const baloo2 = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-baloo',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-lexend',
  display: 'swap',
});

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
    <div className={`${baloo2.variable} ${dmSans.variable} ${lexend.variable}`}>
      <Script
        id="keploy-telemetry-sdk"
        src="https://telemetry.keploy.io/sessions/sdk.js"
        data-endpoint="https://telemetry.keploy.io/sessions/collect"
        data-source="blog"
        strategy="lazyOnload"
      />
      <Announcements />
      {loading ? <PageLoader /> : <Component {...pageProps} />}
    </div>
  );
}

export default MyApp
