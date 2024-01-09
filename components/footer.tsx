import Link from "next/link";
interface LinkItem {
  text: string;
  url: string;
}
interface Section {
  title: string;
  links: LinkItem[];
}

const Footer: React.FC = () => {
  const sections: Section[] = [
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
    <footer className="bg-[#00163d]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-12 gap-8 py-8 md:py-12">
          <div className="sm:col-span-12 lg:col-span-3">
            <div className="mb-2">
              <Link
                href={"https://keploy.io/"}
                className="block"
                aria-label="Keploy"
              >
                <img
                  src="/blog/images/sidebyside-transparent.svg"
                  width={130}
                  alt=""
                />
              </Link>
            </div>
            <div className="text-sm text-neutral-300">
              <a
                href="https://docs.keploy.io/security/"
                className="text-[#e6e2d4] hover:text-[#ff914d] hover:underline transition duration-150 ease-in-out"
              >
                Security
              </a>
              {" · "}
              <a
                href="https://docs.keploy.io/privacy-policy/"
                className="text-[#e6e2d4] hover:text-[#ff914d] hover:underline transition duration-150 ease-in-out"
              >
                Privacy Policy
              </a>
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
            <h6 className="text-[#ff914d] font-[500] mb-2 footer-font tracking-tighter">
              Find us on CNCF Landscape
            </h6>
            <a href="https://landscape.cncf.io/card-mode?selected=keploy">
              <img
                width="200"
                height="100"
                src="https://keploy.io/images/cncf-landscape.png"
                alt="CNCF Landscape"
                className="w-full"
              />
            </a>
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
                    className="w-8 h-8 fill-current"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M24 11.5c-.6.3-1.2.4-1.9.5.7-.4 1.2-1 1.4-1.8-.6.4-1.3.6-2.1.8-.6-.6-1.5-1-2.4-1-1.7 0-3.2 1.5-3.2 3.3 0 .3 0 .5.1.7-2.7-.1-5.2-1.4-6.8-3.4-.3.5-.4 1-.4 1.7 0 1.1.6 2.1 1.5 2.7-.5 0-1-.2-1.5-.4 0 1.6 1.1 2.9 2.6 3.2-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.3 3.1 2.3-1.1.9-2.5 1.4-4.1 1.4H8c1.5.9 3.2 1.5 5 1.5 6 0 9.3-5 9.3-9.3v-.4c.7-.5 1.3-1.1 1.7-1.8z"></path>
                  </svg>
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
                  <path d="M16 8.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V22c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z"></path>
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
};

export default Footer;
