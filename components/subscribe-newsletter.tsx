import { useEffect, useRef, useState } from "react";
import styles from "./subscribe-newsletter.module.css";
import { newsLetterSubscriptionUrl } from '../services/constants'
import newsletterBunny from "../public/images/newsletterBunny.png"
import Image from "next/image";
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


export default function SubscribeNewsletter() {
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

  return (
    // <div className="relative bg-secondary-300  rounded-lg  py-10 px-8 md:py-16 md:px-12 shadow-2xl overflow-hidden" data-aos="zoom-y-out">
    <div className="flex flex-col">

    <div className="hidden lg:block ">
    <Image src={newsletterBunny} alt="Image" />
  </div>
    <div className="overflow-x-hidden -mt-8 shadow-md border-b-primary-300 border-b-2 py-6 px-4 sticky top-20" ref={myComponent}>
      <div
        className={`${isVisible ? styles["slide-in"] : "translate-x-full opacity-0"
          }`}
      >
        <div className={"flex flex-col divide-y-2 gap-y-2"}>
            {/* <h1 className="font-semibold text-lg leading-none text-primary-300 mb-2">
            We do newsletters, too
          </h1> */}
          <p className="text-sm text-black pb-2 text-center">
         To get the latest blogs and updates straight to your inbox.
          </p>
          <form
            className="flex flex-col gap-y-4 text-sm"
            onSubmit={submitHandler}
          >
            <input
              type="text"
              placeholder="Full Name"
              className="rounded px-2 py-1"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="rounded px-2 py-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Company Name"
              className="rounded px-2 py-1"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
  <div>
                  <a className="btn text-secondary-300 bg-primary-300 hover:text-white w-full mb-4 sm:w-auto sm:mb-0" href="https://calendar.app.google/8Ncpff4QnAhpVnYd8">Subscribe</a>
                </div>
                            {/* <button
              className={`bg-gradient-to-t ${email ? "from-orange-300 to-orange-600" : "from-gray-300 to-gray-600"} px-2 py-1 rounded hover:to-orange-700 font-bold border-1 border-transparent text-white shadow mt-2 w-min ml-auto`}
              type="submit"
              disabled={!email}
            >
              Subscribe
            </button> */}
          </form>
        </div>
        {subscribed && <p className="text-sm text-accent-200 mt-3">Thanks for subscribing!</p>}
      </div>
    </div>
    </div>

  );
}
