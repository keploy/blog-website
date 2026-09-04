import { useRef, useState } from "react";
import { useRouter } from "next/router";
import styles from "./subscribe-newsletter.module.css";
import { newsLetterSubscriptionUrl } from '../services/constants'
import { useInvisibleRecaptcha, RecaptchaAttribution } from "../lib/use-invisible-recaptcha";
import { sendBlogLead } from "../lib/blog-mql";

export const subscribeMutation = (formData: { fullName: string, email: string, companyName: string, message: string }) => {

  // Missing config must surface as a rejected promise, not a silent `undefined`
  // return — otherwise the caller does `response.data` on undefined and throws a
  // swallowed TypeError, leaving the user with a dead button and no feedback.
  if (!newsLetterSubscriptionUrl) {
    return Promise.reject(new Error("newsletter subscription URL is not configured"));
  }

  // Abort a stalled backend so a hung request can't strand the submit button —
  // `submitting` is only cleared in handleSubscribe's .finally, which never runs
  // while this fetch is pending.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  return fetch(newsLetterSubscriptionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://keploy.io',
    },
    body: JSON.stringify({
      query: 'mutation Subscribe($input: GuestInput!) { subscription(guestInput: $input) }',
      variables: {
        input: {
          fullName: formData.fullName,
          email: formData.email,
          company: formData.companyName,
          message: formData.message
        }
      }
    }),
    signal: controller.signal,
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  }).catch((error) => {
    console.error("Error during subscription:", error);
    throw error;
  }).finally(() => clearTimeout(timer));

};


export default function SubscribeNewsletter(props: { isSmallScreen?: boolean }) {
  const router = useRouter();
  const myComponent = useRef<HTMLDivElement>(null);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  // Honeypot — hidden from humans; bots that auto-fill every field trip it.
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [subscribed, setSubscribed] = useState<boolean>(false);
  // In-flight guard: blocks repeat clicks so we don't fire duplicate lead /
  // Chat-notify POSTs (the subscription upserts by email, but the Chat space
  // gets one ping per click otherwise). The ref is the airtight guard — a fast
  // double-click fires two handlers before React re-renders, so reading the
  // `submitting` state (or the disabled button) still sees the stale `false`.
  // The state drives the disabled/opacity UI; the ref decides who actually runs.
  const submittingRef = useRef<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [emailError, setEmailError] = useState('');
  // Surfaced to the user when a subscribe attempt fails, so a failure is visible
  // instead of dying silently in the console (the old behaviour).
  const [submitError, setSubmitError] = useState('');
  const message = "NEWSLETTER"
  // Don't load Google's script for every reader — only once someone actually
  // interacts with the form (filling three fields leaves it ample time to load).
  const [captchaActive, setCaptchaActive] = useState(false);
  const { script: recaptchaScript, getToken } = useInvisibleRecaptcha(captchaActive);
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const handleSubscribe = async (payload) => {
    try {
      const response = await subscribeMutation(payload);
      // Optional-chain the whole path: `response` is undefined on a
      // misconfigured URL and `response.data` is absent on a GraphQL error
      // shape ({ errors: [...] }) — both used to throw "cannot read 'data'"
      // here and get swallowed, leaving the user with no feedback.
      if (response?.data?.subscription) {
        // Persist the thank-you (no auto-hide) — the form is replaced by it, so
        // the user clearly sees the subscription landed.
        setSubscribed(true);
        setFullName('')
        setEmail('')
        setCompanyName('')
      } else {
        setSubmitError('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error sending subscribe request:', error);
      setSubmitError('Something went wrong. Please try again.');
    }
  };
  const submitHandler = (e) => {
    e.preventDefault();

    // Honeypot — bots fill the hidden company_website field; humans don't.
    // Drop silently client-side too (the endpoint re-checks server-side).
    if (companyWebsite) return;

      if (!isValidEmail(email)) {
    setEmailError("Please enter a valid email address."); 

    setTimeout(() => {
      return setEmailError("");
    }, 2000);
    return 
  }

    // Guard against double-submits — one Chat ping per click otherwise.
    // Check/set the ref synchronously so a second click in the same tick can't
    // slip through before the state re-renders.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    // Clear any stale failure from a previous attempt before retrying.
    setSubmitError('');

    const payload = {
      fullName,
      email,
      companyName,
      message
    };

    // Lead capture rides alongside the newsletter subscription, never gating
    // it: token minting and the /blog-mql POST are fire-and-forget (fail-open,
    // verified server-side via reCAPTCHA Enterprise).
    const page = window.location.href;
    getToken('submit_lead').then((recaptchaToken) => {
      sendBlogLead({
        email: email.trim().toLowerCase(),
        name: fullName.trim(),
        company: companyName.trim(),
        source: 'blog-newsletter',
        page,
        assetType: 'newsletter',
        recaptchaToken,
      });
    });

    // Google Chat notification — fire-and-forget, fail-open. Forwards the lead
    // to a Chat space via the server-side /api/blog-lead-notify handler (which
    // holds the webhook secret). Never gates the subscription.
    fetch(`${router.basePath || ''}/api/blog-lead-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        companyName: companyName.trim(),
        company_website: companyWebsite,
        source: 'blog-newsletter',
        page,
      }),
    }).catch(() => {});

    handleSubscribe(payload).finally(() => {
      submittingRef.current = false;
      setSubmitting(false);
    });
  };
  const isSubscribeDisabled = ()=>{
    return Boolean(!email || !fullName || !companyName || submitting)
  }
  return (
    <div className="flex flex-col">
      <div className="overflow-x-hidden mt-2 shadow-md rounded-lg border-b-primary-300 border-b-2 py-6 px-4 sticky ml-0 sm:ml-10 md:ml-0  w-full" ref={myComponent}>
        <div
          className={`${isVisible ? styles["slide-in"] : "translate-x-full opacity-0"
            }`}
        >
          {subscribed ? (
            // Success replaces the form entirely so the user unmistakably knows
            // the subscription landed (the old tiny 3s green line was easy to miss).
            <div className="flex flex-col items-center justify-center text-center gap-y-3 py-8">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="11" fill="#DCFCE7" stroke="#16a34a" strokeWidth="1.5" />
                <path d="M7.5 12.5l3 3 6-6.5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-base font-bold text-green-800">Thank you for subscribing!</p>
              <p className="text-sm text-gray-600">You&#39;ll get the latest Keploy blogs straight to your inbox.</p>
            </div>
          ) : (
          <div className={"flex flex-col gap-y-2"}>
            <p className="text-sm text-black pb-2 text-center">
              To get the latest blogs and updates straight to your inbox.
            </p>
            <form
              className="flex flex-col gap-y-4 text-sm"
              onSubmit={submitHandler}
              onFocusCapture={() => setCaptchaActive(true)}
            >
              {/* Honeypot — hidden from humans (off-screen, not tabbable, no
                  autofill); a filled value marks the submit as a bot. */}
              <input
                type="text"
                name="company_website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />
              <input
                type="text"
                className="rounded px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ animation: "autowrite 2s steps(30) infinite" }}
                placeholder="Full Name"
              />
              <input
                type="email"
                className="rounded px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ animation: "autowrite 20s steps(30) infinite" }}
                placeholder="Email"
              />
              <input
                type="text"
                className="rounded px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{ animation: "autowrite 2s steps(30) infinite" }}
                placeholder="Company Name"
              />
              <div>
                <button
                  className={`btn text-secondary-300 bg-primary-300 w-full mb-4 sm:mb-0 px-2 py-1 rounded font-bold border-1 border-transparent text-white shadow mt-2 ${isSubscribeDisabled() ? "opacity-50 cursor-not-allowed" : "hover:text-white"}`}
                  type="submit"
                  disabled={isSubscribeDisabled()}
                >
                  Subscribe
                </button>

              </div>
            </form>
            <span className="text-xs mt-2 border-none mb-2 text-center block">
              *<strong>We won&#39;t spam you</strong> only one Email every month.
            </span>
            <RecaptchaAttribution />
            {emailError && <p className="text-sm text-red-500 text-center font-semibold mt-1">{emailError}</p>}
            {submitError && <p className="text-sm text-red-500 text-center font-semibold mt-1">{submitError}</p>}
          </div>
          )}
          {recaptchaScript}
        </div>
      </div>
    </div>

  );
}
