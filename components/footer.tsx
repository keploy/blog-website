import Link from "next/link";
import Logo from './logo';
import Image from "next/image";
import CNCF from "../public/images/cncf-landscape.png";
import GSA from "../public/images/gsa.png";

export default function Footer() {
  const sections = [
    {
      title: "Resources",
      links: [
        { text: "Documentation", url: "https://docs.keploy.io/" },
        { text: "Tech Blog", url: "https://blog.keploy.io/" },
        { text: "Community Blog", url: "https://community.keploy.io/" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "Home", url: "#0" },
        { text: "Security", url: "https://docs.keploy.io/security/" },
        {
          text: "Privacy Policy",
          url: "https://docs.keploy.io/privacy-policy/",
        },
      ],
    },
  ];
  return (
    <footer className="bg-secondary-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-12 gap-8 py-8 md:py-12">

          <div className="sm:col-span-12 lg:col-span-3">
            <div className="mb-2">
              <Logo />
            </div>
            <div className="text-sm text-neutral-300">
              <Link href="https://keploy.io/docs/security/" className="text-neutral-300 hover:text-primary-300 hover:underline transition duration-150 ease-in-out">Security</Link> · <Link href="https://docs.keploy.io/privacy-policy/" className="text-neutral-300 hover:text-primary-300 hover:underline transition duration-150 ease-in-out">Privacy Policy</Link>
            </div>
          </div>

          {sections.map((section, index) => (
            <div
              key={index}
              className="sm:col-span-6 md:col-span-4 lg:col-span-3"
            >
              <h6 className="text-[#ff914d] font-[500] mb-2 footer-font tracking-tighter">
                {section?.title}
              </h6>
              <ul className="text-sm">
                {section?.links?.map((link, linkIndex) => (
                  <li key={linkIndex} className="mb-2">
                    <Link
                      href={link.url}
                      className="text-[#e6e2d4] hover:text-[#ff914d] transition duration-150 ease-in-out"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="sm:col-span-6 md:col-span-4 lg:col-span-3">
            <h6 className="text-primary-300 font-medium mb-2">Find us on CNCF Landscape</h6>
            <Link href="https://landscape.cncf.io/?item=app-definition-and-development--continuous-integration-delivery--keploy" target="_blank">
              <Image width={200} height={100} src={CNCF} alt="CNCF Landscape" className=" sm:w-9/12" />
            </Link>
            <Link href="https://blog.google/intl/en-in/introducing-the-eighth-cohort-of-google-for-startups-accelerator-india/" target="_blank">
              <Image width={200} height={100} src={GSA} alt="Google for Startups" className=" sm:w-9/12 py-2" />
            </Link>
          </div>
        </div>

        <div className="md:flex md:items-center md:justify-between py-4 md:py-8 border-t border-gray-200">
          <ul className="flex items-center mb-4 md:order-1 md:ml-4 md:mb-0">
            <li>
              <Link
                href="https://twitter.com/Keployio"
                className="flex justify-center items-center w-10 h-10 text-secondary-300 hover:text-primary-300 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out"
                aria-label="Twitter"
                target="_blank"
              >
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M 20.476562 0.00390625 L 24.464844 0.00390625 L 15.753906 10.167969 L 26 23.996094 L 17.976562 23.996094 L 11.691406 15.609375 L 4.503906 23.996094 L 0.511719 23.996094 L 9.828125 13.125 L 0 0.00390625 L 8.226562 0.00390625 L 13.90625 7.671875 Z M 19.078125 21.558594 L 21.285156 21.558594 L 7.027344 2.3125 L 4.65625 2.3125 Z M 19.078125 21.558594" transform="scale(0.8)"/>
                </svg>
              </Link>
            </li>
            <li className="ml-4">
              <Link
                href="https://www.linkedin.com/company/keploy/"
                className="flex justify-center items-center w-10 h-10 text-secondary-300 hover:text-primary-300 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out"
                aria-label="LinkedIn"
                target="_blank"
              >
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Link>
            </li>
            <li className="ml-4">
              <Link
                href="https://www.youtube.com/@keploy"
                className="flex justify-center items-center w-10 h-10 text-secondary-300 hover:text-primary-300 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out"
                aria-label="YouTube"
                target="_blank"
              >
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M23.498 6.186a2.997 2.997 0 0 0-2.11-2.123C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.518A2.997 2.997 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.997 2.997 0 0 0 2.11 2.123c1.883.518 9.388.518 9.388.518s7.505 0 9.388-.518a2.997 2.997 0 0 0 2.11-2.123C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </Link>
            </li>
            <li className="ml-4">
              <Link
                href="https://www.instagram.com/keploy.io/"
                className="flex justify-center items-center w-10 h-10 text-secondary-300 hover:text-primary-300 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out"
                aria-label="Instagram"
                target="_blank"
              >
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Link>
            </li>
            <li className="ml-4">
              <Link
                href="https://www.github.com/keploy/keploy"
                className="flex justify-center items-center w-10 h-10 text-secondary-300 hover:text-primary-300 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out"
                aria-label="Github"
                target="_blank"
              >
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </Link>
            </li>
          </ul>
          <div className="text-sm text-neutral-300 mr-4">
            © Keploy Inc {new Date().getFullYear()}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}