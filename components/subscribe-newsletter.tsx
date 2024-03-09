import { useEffect, useRef, useState } from "react";
import styles from "./subscribe-newsletter.module.css";

export default function SubscribeNewsletter() {
  const myComponent = useRef<HTMLDivElement>(null);
  const [isVisible, setVisible] = useState<boolean>(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
          } else {
            setVisible(false);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );
    observer.observe(myComponent.current);
    return () => {
      observer.unobserve(myComponent.current);
      observer.disconnect();
    };
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();
  };

  return (
    <div className="overflow-x-hidden" ref={myComponent}>
      <div
        className={`${
          isVisible ? styles["slide-in"] : "translate-x-full opacity-0"
        }`}
      >
        <div className={"flex flex-col divide-y-2 gap-y-2"}>
          <h1 className="font-bold text-2xl leading-none">
            We do newsletters, too
          </h1>
          <p className="text-sm text-gray-500 pt-2">
            Join the conversation. Fill out this form to get our newsletter.
          </p>
          <form
            action=""
            className="flex flex-col gap-y-2 text-sm"
            onSubmit={submitHandler}
          >
            <input
              type="text"
              placeholder="Full Name"
              className="rounded px-2 py-1"
            />
            <input
              type="email"
              placeholder="Email"
              className="rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="Company Name"
              className="rounded px-2 py-1"
            />
            <button
              className="bg-gradient-to-t from-orange-300 to-orange-600 px-2 py-1 rounded hover:to-orange-700 font-bold border-1 border-transparent text-white shadow mt-2 w-min ml-auto"
              type="submit"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
