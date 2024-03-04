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
              <a href="https://keploy.io/docs/security/" className="text-neutral-300 hover:text-primary-300 hover:underline transition duration-150 ease-in-out">Security</a> · <a href="https://docs.keploy.io/privacy-policy/" className="text-neutral-300 hover:text-primary-300 hover:underline transition duration-150 ease-in-out">Privacy Policy</a>
            </div>
          </div>

          {sections.map((section, index) => (
            <div
              key={index}
              className="sm:col-span-6 md:col-span-4 lg:col-span-3"
            >
              <h6 className="text-[#ff914d] font-[500] mb-2 footer-font tracking-tighter mb-2">
                {section?.title}
              </h6>
              <ul className="text-sm">
                {section?.links?.map((link, linkIndex) => (
                  <li key={linkIndex} className="mb-2">
                    <a
                      href={link.url}
                      className="text-[#e6e2d4] hover:text-[#ff914d] transition duration-150 ease-in-out"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="sm:col-span-6 md:col-span-4 lg:col-span-3">
            <h6 className="text-primary-300 font-medium mb-2">Find us on CNCF Landscape</h6>
            <Link href="https://landscape.cncf.io/card-mode?selected=keploy">
              <Image width={200} height={100} src={CNCF} alt="CNCF Landscape" className=" sm:w-9/12" />
            </Link>
            <Link href="https://blog.google/intl/en-in/introducing-the-eighth-cohort-of-google-for-startups-accelerator-india/">
              <Image width={200} height={100} src={GSA} alt="CNCF Landscape" className=" sm:w-9/12 py-2" />
            </Link>
          </div>
        </div>

        <div className="md:flex md:items-center md:justify-between py-4 md:py-8 border-t border-gray-200">
          <ul className="flex mb-4 md:order-1 md:ml-4 md:mb-0">
            <li>
              <a
                href="https://twitter.com/Keployio"
                className="flex justify-center items-center text-secondary-300 hover:text-primary-300 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out"
                aria-label="Twitter"
              >
                <svg
                  className="w-8 h-8 fill-current"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="27px" height="22px"
                      viewBox="0 -16 20 40"
                      version="1.1"
                    >
                  <path d="M 20.476562 0.00390625 L 24.464844 0.00390625 L 15.753906 10.167969 L 26 23.996094 L 17.976562 23.996094 L 11.691406 15.609375 L 4.503906 23.996094 L 0.511719 23.996094 L 9.828125 13.125 L 0 0.00390625 L 8.226562 0.00390625 L 13.90625 7.671875 Z M 19.078125 21.558594 L 21.285156 21.558594 L 7.027344 2.3125 L 4.65625 2.3125 Z M 19.078125 21.558594 "></path>                  </svg>
                </svg>
              </a>
            </li>
            <li className="ml-4">
              <a
                href="https://www.github.com/keploy/keploy"
                className="flex justify-center items-center text-secondary-300 hover:text-primary-300 bg-white hover:bg-white-100 rounded-full shadow transition duration-150 ease-in-out"
                aria-label="Github"
              >
                <svg
                  className="w-8 h-8 fill-current"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 8.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V22c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z"/>
                </svg>
              </a>
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


