import { useEffect, useRef, useState } from "react";
import styles from "./subscribe-newsletter.module.css";
import { newsLetterSubscriptionUrl } from '../services/constants'
import newsletterBunny from "../public/images/newsletterBunny.png"
import Image from "next/image";
import { gsap } from "gsap";

export const subscribeMutation = (formData: { fullName: string, email: string, companyName: string, message: string }) => {


  return fetch(newsLetterSubscriptionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000',
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
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  }).catch((error) => {
    console.error("Error during subscription:", error);
    throw error;
  });
};


export default function SubscribeNewsletter(props: { isSmallScreen: Boolean }) {
  const myComponent = useRef<HTMLDivElement>(null);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const message = "NEWSLETTER"

  const handleSubscribe = async (payload) => {
    try {
      const response = await subscribeMutation(payload);
      if (response.data.subscription) {
        setSubscribed(true);
        setFullName('')
        setEmail('')
        setCompanyName('')
        setTimeout(() => {

          setSubscribed(false);
        }, 3000)
      } else {
        console.error('Subscribe request failed.');
      }
    } catch (error) {
      console.error('Error sending subscribe request:', error);
    }
  };
  const submitHandler = (e) => {
    e.preventDefault();
    const payload = {
      fullName,
      email,
      companyName,
      message
    };

    handleSubscribe(payload)
  };
  const bunnyRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!props.isSmallScreen) {
        gsap.to(bunnyRef.current, { y: -180, duration: 1, yoyo: true, repeat: 1 })
          .then(() => {
            gsap.to(bunnyRef.current, { y: 100, duration: 0.4 }); 
          });
      } else {
        gsap.to(bunnyRef.current, { y: 0 });
      }
    }, 1000);
    return () => {
      clearTimeout(timer);
      gsap.killTweensOf(bunnyRef.current); 
    };
  }, [props.isSmallScreen]);
  return (
    <div className="flex flex-col" ref={bunnyRef}>
      <div className="hidden lg:block ">
        <Image src={newsletterBunny} alt="Image" />
      </div>
      <div className="overflow-x-hidden mt-2 lg:-mt-7 shadow-md border-b-primary-300 border-b-2 py-6 px-4 sticky ml-0 sm:ml-10 md:ml-0  w-full" ref={myComponent}>
        <div
          className={`${isVisible ? styles["slide-in"] : "translate-x-full opacity-0"
            }`}
        >
          <div className={"flex flex-col divide-y-2 gap-y-2"}>
            <p className="text-sm text-black pb-2 text-center">
              To get the latest blogs and updates straight to your inbox.
            </p>
            <form className="flex flex-col gap-y-4 text-sm" onSubmit={submitHandler}>
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
                  className={`btn text-secondary-300 bg-primary-300 w-full mb-4 sm:mb-0 px-2 py-1 rounded font-bold border-1 border-transparent text-white shadow mt-2 ${!email ? "opacity-50 cursor-not-allowed" : "hover:text-white"}`}
                  type="submit"
                  disabled={!email}
                >
                  Subscribe
                </button>

              </div>
            </form>
            <span className="text-xs mt-2 border-none mb-2 text-center block">
              *<strong>We won&#39;t spam you</strong> one newsletter per month at most.
            </span>
          </div>
          {subscribed && <p className="text-sm text-green-800 text-center font-semibold mt-3">Thanks for subscribing!</p>}
        </div>
      </div>
    </div>

  );
}
