import Link from "next/link";
import Image from "next/image";
import sideBySideSvg from "../public/images/sidebyside-transparent.svg";
import { SocialIcons } from "./footerIcons"; 

export default function Footer() {
  const sections = [
    {
      title: "Solutions",
      links: [
        { text: "API Testing", url: "https://keploy.io/api-testing" },
        { text: "Integration Testing", url: "https://keploy.io/integration-testing" },
        { text: "Unit Testing", url: "https://keploy.io/unit-test-generator" },
        { text: "VS Code Extension", url: "https://marketplace.visualstudio.com/items?itemName=Keploy.keployio" },
      ],
    },
    {
      title: "Developers",
      links: [
        { text: "Documentation", url: "https://keploy.io/docs/" },
        { text: "CLI Reference", url: "https://keploy.io/docs/running-keploy/cli-commands/" },
        { text: "Github", url: "https://github.com/keploy" },
        { text: "Getting Started", url: "https://keploy.io/docs/server/installation/" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Integrations", url: "https://keploy.io/docs/ci-cd/github/" },
        { text: "Blog", url: "https://keploy.io/blog" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "Career", url: "https://keploy.io/about" }, 
        { text: "Privacy", url: "https://keploy.io/privacy-policy" },
        {
          text: "Cookie Policy",
          url: "https://keploy.io/cookie-policy", 
        },
      ],
    },
  ];

  const socialLinks = [
    {
      name: "Twitter",
      url: "https://twitter.com/keploy",
      icon: SocialIcons.twitter,
    },
    {
      name: "GitHub",
      url: "https://github.com/keploy",
      icon: SocialIcons.github,
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/company/keploy",
      icon: SocialIcons.linkedin,
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@keploy",
      icon: SocialIcons.youtube,
    },
  ];

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-20"> 
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:mr-10">
              <Image
                src={sideBySideSvg}
                alt="Keploy Logo"
                className="h-[50px] w-[100px]"
              />
              <div className="flex space-x-6 my-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-500 transition-colors" 
                      href={social.url}
                    >
                      <span className="sr-only">{social.name}</span>
                      <Icon />
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:grid-cols-4 w-full">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="lg:mt-4"
                >
                  <h3 className="text-base font-semibold text-gray-900"> 
                    {section?.title}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {section?.links?.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.url}
                          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                          target={link.url.startsWith('/') ? '_self' : '_blank'} 
                        >
                          {link.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
        </div>

        <div className="my-12 pt-8 border-t border-gray-200"> 
          <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between">
            <p className="mt-8 text-sm text-gray-500 md:mt-0">© Keploy Inc</p>
          </div>
        </div>
      </div>
    </footer>
  );
}