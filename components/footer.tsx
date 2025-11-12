import Link from "next/link";
import Logo from "./logo";
 

export default function Footer() {
  const sections = [
    {
      title: "Solutions",
      links: [
        { text: "API Testing", url: "https://keploy.io/docs/" },
        { text: "Integration Testing", url: "https://keploy.io/docs/integration-testing" },
        { text: "Unit Testing", url: "https://keploy.io/docs/unit-testing" },
        { text: "VS Code Extension", url: "https://marketplace.visualstudio.com/items?itemName=Keploy.keploy" },
      ],
    },
    {
      title: "Developers",
      links: [
        { text: "Documentation", url: "https://docs.keploy.io/" },
        { text: "CLI Reference", url: "https://docs.keploy.io/docs/cli-reference" },
        { text: "GitHub", url: "https://github.com/keploy/keploy" },
        { text: "Getting Started", url: "https://docs.keploy.io/docs/getting-started" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Integrations", url: "https://docs.keploy.io/docs/integrations" },
        { text: "Blog", url: "https://blog.keploy.io/" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "Career", url: "https://keploy.io/careers" },
        { text: "Privacy", url: "https://docs.keploy.io/privacy-policy/" },
        { text: "Cookie Policy", url: "https://docs.keploy.io/cookie-policy/" },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Top Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-12">

          {/* Logo + Social */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <Logo />
            </div>

            {/* Social Icons */}
            <div className="flex space-x-4 mt-2">
              <Link href="https://twitter.com/Keployio" target="_blank" aria-label="Twitter" className="text-gray-500 hover:text-[#ff914d] transition">
                <i className="fa-brands fa-x-twitter text-xl"></i>
              </Link>
              <Link href="https://github.com/keploy/keploy" target="_blank" aria-label="GitHub" className="text-gray-500 hover:text-[#ff914d] transition">
                <i className="fa-brands fa-github text-xl"></i>
              </Link>
              <Link href="https://www.linkedin.com/company/keploy/" target="_blank" aria-label="LinkedIn" className="text-gray-500 hover:text-[#ff914d] transition">
                <i className="fa-brands fa-linkedin-in text-xl"></i>
              </Link>
              <Link href="https://www.youtube.com/@keploy" target="_blank" aria-label="YouTube" className="text-gray-500 hover:text-[#ff914d] transition">
                <i className="fa-brands fa-youtube text-xl"></i>
              </Link>
            </div>
          </div>

          {/* Dynamic Sections */}
          {sections.map((section, index) => (
            <div key={index}>
              <h6 className="text-[#ff914d] font-semibold mb-3 tracking-tight">
                {section.title}
              </h6>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.url}
                      className="text-gray-600 hover:text-[#ff914d] transition-colors duration-150 ease-in-out text-sm"
                      target="_blank"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between py-6 text-sm text-gray-500">
          <p>© Keploy Inc {new Date().getFullYear()}</p>

          <div className="flex space-x-4 mt-3 md:mt-0">
            <Link href="https://docs.keploy.io/privacy-policy/" target="_blank" className="hover:text-[#ff914d] transition">Privacy</Link>
            <Link href="https://docs.keploy.io/cookie-policy/" target="_blank" className="hover:text-[#ff914d] transition">Cookie Policy</Link>
          </div>
        </div>

        
      </div>
    </footer>
  );
}
