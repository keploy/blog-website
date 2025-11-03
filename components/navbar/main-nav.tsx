"use client";

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
    <div className="relative h-full w-full rounded-xl p-[1.5px] bg-gradient-to-r from-orange-500 to-yellow-400/60 transition-all duration-200 group-hover:scale-[1.01]">
      <Card className="relative h-full w-full overflow-hidden rounded-[calc(0.75rem-3px)] bg-card text-foreground transition-colors">
        <CardContent className="relative w-full h-full p-0">
          {item.image && (
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover w-full h-full transition-all duration-300 group-hover:blur-[1px]"
              priority
            />
          )}
          <div className="absolute z-10 text-left px-3 py-2 backdrop-blur-sm bg-background/70 rounded-lg">
            <h3 className="text-sm font-medium truncate text-foreground dark:text-gray-100">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-xs text-muted-foreground dark:text-gray-400">
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
  <div className="rounded-lg p-[1.5px]">
    <Link
      href={content.href}
      className="group relative block w-full overflow-hidden rounded-[calc(0.5rem-1.5px)] p-2 transition-all duration-200 bg-background text-foreground dark:text-gray-100 border border-border hover:border-orange-400"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "relative w-10 h-10 flex-shrink-0 border border-border rounded-md flex items-center justify-center",
            content.logoBg || "bg-muted"
          )}
        >
          <content.logo className="w-6 h-6 text-primary" />
        </div>
        <div className="flex flex-col">
          <p className="text-[12px] font-medium leading-snug text-primary group-hover:text-orange-400 transition-colors">
            {content.title}
          </p>
          {content.subtitle && (
            <p className="text-[10px] text-muted-foreground dark:text-gray-400 leading-snug mt-0.5">
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
      <h4 className="text-sm font-medium text-muted-foreground dark:text-gray-300">
        {title}
      </h4>
    )}
    <div className="grid gap-1">
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className="group flex items-center text-sm text-foreground dark:text-gray-200 hover:text-orange-400 p-1 transition-colors"
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
    <NavigationMenu className="hidden md:flex p-2 transition-colors">
      <NavigationMenuList className="space-x-1 text-gray-900 dark:text-gray-100">
        {/* Products */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9 text-md rounded-md px-3 py-1.5 transition-colors text-gray-900 dark:text-gray-100 hover:bg-muted hover:text-orange-400">
            Products
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-auto min-w-[850px] max-w-[95vw] p-4 bg-background text-foreground dark:text-gray-100 border border-border">
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
          <NavigationMenuTrigger className="h-9 text-md rounded-md px-3 py-1.5 transition-colors text-gray-900 dark:text-gray-100 hover:bg-muted hover:text-orange-400">
            Solutions
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-auto min-w-[850px] max-w-[95vw] p-4 bg-background text-foreground dark:text-gray-100 border border-border">
            <div className="grid grid-cols-4 gap-4 items-stretch">
              <div className="col-span-3 flex gap-4 h-[250px]">
                {solutionsNav.cardContent.map((item, index) => (
                  <ResponsiveBlock key={index} item={item} className="flex-1" />
                ))}
              </div>
              <div className="space-y-3 py-2 lg:col-span-1 border-l border-border pl-4">
                <p className="text-sm font-medium text-muted-foreground dark:text-gray-300">
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
          <NavigationMenuTrigger className="h-9 text-md rounded-md px-3 py-1.5 transition-colors text-gray-900 dark:text-gray-100 hover:bg-muted hover:text-orange-400">
            Developers
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-auto min-w-[850px] max-w-[95vw] p-4 bg-background text-foreground dark:text-gray-100 border border-border">
            <div className="grid grid-cols-3 gap-4 items-stretch">
              <ResponsiveBlock
                item={developersNav.cardContent[0]}
                className="h-[350px]"
              />
              <ResponsiveBlock
                item={developersNav.cardContent[1]}
                className="h-[350px]"
              />
              <div className="flex flex-col h-[350px] gap-4 border-l border-border pl-4">
                {developersNav.developerStackedCards.map((card, index) => (
                  <InfoCardBlock
                    key={index}
                    title={card.title}
                    subtitle={card.subtitle}
                    href={card.href}
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
            href="https://keploy.io/pricing"
            className="inline-flex items-center justify-center rounded-md font-medium transition-colors text-gray-900 dark:text-gray-100 hover:text-orange-400 h-9 px-3 py-1.5 hover:underline text-[16px]"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pricing
          </Link>
        </NavigationMenuItem>

        {/* Resources */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9 text-md rounded-md px-3 py-1.5 transition-colors text-gray-900 dark:text-gray-100 hover:bg-muted hover:text-orange-400">
            Resources
          </NavigationMenuTrigger>
          <NavigationMenuContent className="w-auto min-w-[850px] max-w-[95vw] p-4 bg-background text-foreground dark:text-gray-100 border border-border">
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
              <div className="flex flex-col h-[350px] gap-4 border-l border-border pl-4 py-2">
                {resourcesNav.resourceStackedCards.map((card, index) => (
                  <InfoCardBlock
                    key={index}
                    title={card.title}
                    subtitle={card.subtitle}
                    href={card.href}
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
