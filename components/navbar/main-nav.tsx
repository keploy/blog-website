import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../../components/ui/navigation-menu";
import {
  resourcesNav,
  solutionsNav,
  productsNav,
  developersNav,
} from "../../config/nav";
import { Card, CardContent } from "../../components/ui/card";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { InfoCardBlock } from "../../components/navbar/nav-card";

interface FeaturedCardContent {
  href: string;
  logo: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle?: string;
  logoBg?: string;
}
interface QuickLink {
  title: string;
  href: string;
  sectionTitle?: string;
}

interface BlockItem {
  title: string;
  href: string;
  description?: string;
  image?: string | StaticImageData;
  target?: string;
  fontColor?: string;
}
type BlockProps = {
  item: BlockItem;
  aspectRatio?: string;
  minHeight?: string;
};

const ResponsiveBlock = ({
  item,
  className = "",
}: BlockProps & { className?: string }) => (
  <Link
    href={item.href}
    target={item.target || "_blank"}
    className={`group block w-full h-full ${className}`}
    rel="noopener noreferrer"
  >
    <div className="relative h-full w-full rounded-xl p-[1.5px] bg-gradient-to-r from-[#FF7A0C] to-[#FFA74F]/[0.36] transition-all duration-200 group-hover:scale-[1.01]">
      {" "}
      {/* Gradient border, scale/transition moved here */}
      <Card className="relative h-full w-full overflow-hidden rounded-[calc(0.75rem-3px)] bg-card">
        <CardContent className="relative w-full h-full p-0">
          <div className="absolute inset-x-0 top-0 h-1/3  pointer-events-none z-[1]" />

          {item.image && (
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover w-full h-full transition-all duration-300 group-hover:blur-[1px]" // Blur effect remains on image
              priority
            />
          )}
          {/* Text content */}
          <div className="absolute z-10 text-left px-3 py-2 backdrop-blur-sm bg-white/10 rounded-lg">
            {" "}
            {/* Keep backdrop blur if desired */}
            <h3
              className={cn(
                "text-sm font-medium whitespace-nowrap truncate",
                item.fontColor || "text-gray-900/80" // Use appropriate text color for contrast
              )}
            >
              {item.title}
            </h3>
            {item.description && (
              <p className="text-[.75em] text-[#737373]">
                {item.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  </Link>
);
const FeaturedCard = ({ content }: { content: FeaturedCardContent }) => (
  // Outer div for gradient border
  <div className="rounded-lg p-[1.5px] ">
    {" "}
    {/* Gradient border */}
    {/* Inner Link/Content Area */}
    <Link
      href={content.href}
      className="group relative block w-full overflow-hidden rounded-[calc(0.5rem-1.5px)] p-2 transition-all duration-200 bg-[#FFFCFA]" // Inner background
      target="_blank" // Assuming it opens in a new tab based on config
      rel="noopener noreferrer"
    >
      <div className="flex items-center gap-3">
        {" "}
        {/* Flex container for logo and text */}
        {/* Logo container */}
        <div
          className={cn(
            "relative w-10 h-10 flex-shrink-0 border border-orange-100 rounded-md flex items-center justify-center", // Adjusted border color
            content.logoBg || "bg-white" // Default white background for logo area
          )}
        >
          <content.logo className="w-6 h-6 text-primary/80" /> {/* Logo */}
        </div>
        {/* Text container */}
        <div className="flex flex-col">
          <p className="text-[12px] font-medium leading-snug text-primary/90 group-hover:text-primary transition-colors">
            {" "}
            {/* Title */}
            {content.title}
          </p>
          {/* Subtitle (conditionally rendered) */}
          {content.subtitle && (
            <p className="text-[10px] text-[#737373] leading-snug mt-0.5">
              {" "}
              {/* Subtitle styling */}
              {content.subtitle}
            </p>
          )}
        </div>
      </div>
    </Link>
  </div>
);

const QuickLinks = ({
  title,
  links,
}: {
  title?: string;
  links: QuickLink[];
}) => (
  <div className="space-y-2">
    {title && (
      <h4 className="text-sm font-medium text-[#737373]">{title}</h4>
    )}
    <div className="grid gap-1">
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className="group flex items-center text-sm hover:text-primary p-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="truncate text-[13px]">{link.title}</span>
          <ChevronRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
        </Link>
      ))}
    </div>
  </div>
);

export function MainNav() {
  return (
    <NavigationMenu className="hidden md:flex p-2">
      <NavigationMenuList className="space-x-1">
        {/* Product */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9 text-md rounded-md px-3 py-1.5 transition-colors hover:bg-gray-100">
            Products
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-auto min-w-[850px] max-w-[95vw] p-4">
            <div className="grid grid-cols-2 gap-4 items-stretch">
              <ResponsiveBlock
                item={productsNav.cardContent[0]}
                className="h-[350px]"
              />
              <div className="flex flex-col gap-4 h-[350px]">
                <ResponsiveBlock
                  item={productsNav.cardContent[1]}
                  className="flex-1"
                />
                <ResponsiveBlock
                  item={productsNav.cardContent[2]}
                  className="flex-1"
                />
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {/* Solutions */}
        <NavigationMenuItem value="solutions">
          <NavigationMenuTrigger className="h-9 text-md rounded-md px-3 py-1.5 transition-colors hover:bg-gray-100">
            Solutions
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-auto min-w-[850px] max-w-[95vw] p-4">
            <div className="grid grid-cols-4 gap-4 items-stretch">
              <div className="col-span-3 flex gap-4 h-[250px]">
                {solutionsNav.cardContent.map((item, index) => (
                  <ResponsiveBlock key={index} item={item} className="flex-1" />
                ))}
              </div>

              <div className="space-y-3 py-2 lg:col-span-1 border-l border-zinc-200 pl-4">
                <p className="text-sm font-medium text-[#737373]">
                  {solutionsNav.featuredContent.title}
                </p>

                <FeaturedCard
                  content={solutionsNav.featuredContent.featuredCard}
                />

                <QuickLinks
                  title={solutionsNav.featuredContent.quickLinksTitle}
                  links={solutionsNav.featuredContent.links}
                />
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {/* Developers */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9 text-md rounded-md px-3 py-1.5 transition-colors hover:bg-gray-100">
            Developers
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-auto min-w-[850px] max-w-[95vw] p-4">
            <div className="grid grid-cols-3 gap-4 items-stretch">
              <ResponsiveBlock
                item={developersNav.cardContent[0]}
                className="h-[350px]"
              />
              <ResponsiveBlock
                item={developersNav.cardContent[1]}
                className="h-[350px]"
              />

              <div className="flex flex-col h-[350px] gap-4 border-l border-zinc-200 pl-4 ">
                {developersNav.developerStackedCards.map((card, index) => (
                  <InfoCardBlock
                    key={index}
                    title={card.title}
                    subtitle={card.subtitle}
                    href={card.href}
                    // badge={card.badge}
                    icon={card.icon}
                  />
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {/* Pricing */}
        <NavigationMenuItem>
          <Link
            href="/pricing"
            className="inline-flex items-center text-black/80 justify-center rounded-md font-medium transition-colors hover:text-primary h-9 px-3 py-1.5 hover:underline text-[16px]"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pricing
          </Link>
        </NavigationMenuItem>
        {/* Resources */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9 text-md rounded-md px-3 py-1.5 transition-colors hover:bg-gray-100">
            Resources
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-auto min-w-[850px] max-w-[95vw] p-4">
            <div className="grid grid-cols-3 gap-4 items-stretch">
              <div className="flex flex-col gap-4 h-[350px]">
                <ResponsiveBlock
                  item={resourcesNav.cardContent[0]}
                  className="flex-1"
                />
                <ResponsiveBlock
                  item={resourcesNav.cardContent[1]}
                  className="flex-1"
                />
              </div>
              <ResponsiveBlock
                item={resourcesNav.cardContent[2]}
                className="h-[350px]"
              />
              <div className="flex flex-col h-[350px] gap-4 border-l border-zinc-200 pl-4 py-2">
                {resourcesNav.resourceStackedCards.map((card, index) => (
                  <InfoCardBlock
                    key={index}
                    title={card.title}
                    subtitle={card.subtitle}
                    href={card.href}
                    // badge={card.badge} // Optional: pass badge if defined
                    icon={card.icon}
                    backgroundImage={card.backgroundImage}
                  />
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
