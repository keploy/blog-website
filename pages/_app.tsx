import { AppProps } from 'next/app';
import { Baloo_2, DM_Sans, Lexend } from 'next/font/google';
import '../styles/index.css';
import Router from "next/router";
import Script from 'next/script';

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic'
import { trackAiReferral } from '@/utils/aiReferralTracker';
import { ANNOUNCEMENT_ENABLED } from '../components/announcementConfig';
// Lazy + client-only: the bar is a non-critical global widget (often disabled
// via ANNOUNCEMENT_ENABLED). Code-splitting it keeps Marquee + lucide icons out
// of the shared _app bundle, and gating the render on ANNOUNCEMENT_ENABLED (a
// flag from a Marquee-free module) means the chunk is never even fetched while
// the bar is off. Safe because --announcement-h defaults to 0px in
// styles/index.css, so offsets are correct before this chunk loads.
const Announcements = dynamic(
  () => import('../components/Announcements').then((m) => m.Announcements),
  { ssr: false }
);

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
  // Lexend is used only by the InlinePromoCard, which is dynamically imported
  // deep in the article body (below the fold). Don't preload it — that would
  // put its font files on the critical path on post pages for content the user
  // hasn't scrolled to yet. It still loads on demand (display:swap) when the
  // card renders. No effect on routes that don't use the card.
  preload: false,
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
      {/* Also expose the font variables at :root so nodes portaled into
          document.body (TOC/keyword tooltips) inherit them — CSS variables
          inherit down the DOM tree, not the React tree, so the wrapper div
          above doesn't reach portals living outside it. */}
      <style jsx global>{`
        :root {
          --font-baloo: ${baloo2.style.fontFamily};
          --font-dm-sans: ${dmSans.style.fontFamily};
          --font-lexend: ${lexend.style.fontFamily};
        }
      `}</style>
      <Script
        id="keploy-telemetry-sdk"
        src="https://telemetry.keploy.io/sessions/sdk.js"
        data-endpoint="https://telemetry.keploy.io/sessions/collect"
        data-source="blog"
        strategy="lazyOnload"
      />
      {ANNOUNCEMENT_ENABLED && <Announcements />}
      {loading ? <PageLoader /> : <Component {...pageProps} />}
    </div>
  );
}

export default MyApp
