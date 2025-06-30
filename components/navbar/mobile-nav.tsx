import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../../components/navbar/Sheet";
import { Menu } from "lucide-react";
import { Button } from "../../components/navbar/Button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/navbar/Accordion";
import Link from "next/link";
import { cn } from "../../lib/utils/utils";
import {
  productsNav,
  solutionsNav,
  developersNav,
  resourcesNav,
} from "../../config/nav";

const MobileNavSection = ({
  title,
  items,
  featuredContent,
}: {
  title: string;
  items: any[];
  featuredContent?: any;
}) => {
  return (
    <AccordionItem value={title}>
      <AccordionTrigger className="text-sm text-black/90">
        {title}
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 px-1">
          {items.map((column, idx) => (
            <div key={idx}>
              <div className="mb-2">
                {column.isClickable ? (
                  <Link
                    href={column.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary"
                  >
                    {column.title}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">
                    {" "}
                    {column.title}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {column.items.map((item: any, itemIdx: number) => (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    className="group flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-accent"
                  >
                    <span
                      className={cn(
                        "p-1 rounded-md border border-muted-foreground/20",
                        "group-hover:bg-orange-500/10"
                      )}
                    >
                      <item.icon className={cn("h-4 w-4", item.iconColor)} />
                    </span>
                    <span className="font-medium text-black/90">
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          {featuredContent && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-black/90 ">
                {featuredContent.title}
              </p>
              <Link
                href={featuredContent.featuredCard.href}
                className="block rounded-lg border p-3 hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      featuredContent.featuredCard.logoBg
                    )}
                  >
                    <featuredContent.featuredCard.logo />
                  </div>
                  <p className="text-sm">
                    {featuredContent.featuredCard.title}
                  </p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="xl:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-[300px] p-0 pt-2 bg-white">
        <SheetTitle className="px-6 pt-4 text-black/85 font-semi">
          Menu
        </SheetTitle>
        <div className="px-6 overflow-y-auto h-full">
          <Accordion type="single" collapsible className="w-full">
            <MobileNavSection
              title="Products"
              items={productsNav.mainColumns}
              featuredContent={productsNav.featuredContent}
            />
            <MobileNavSection
              title="Solutions"
              items={solutionsNav.mainColumns}
              featuredContent={solutionsNav.featuredContent}
            />
            <MobileNavSection
              title="Developers"
              items={developersNav.mainColumns}
              featuredContent={developersNav.featuredContent}
            />
            <MobileNavSection
              title="Resources"
              items={resourcesNav.mainColumns}
              featuredContent={resourcesNav.featuredContent}
            />

            <div className="py-4 border-t">
              <Link
                href="/pricing"
                className="flex w-full items-center justify-between py-2 font-medium hover:underline"
              >
                Pricing
              </Link>
            </div>
          </Accordion>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-white">
          <Button
            variant="default"
            asChild
            className="w-full text-white px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-red-500 hover:to-orange-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out items-center justify-center relative overflow-hidden"
          >
            <Link
              href="https://app.keploy.io"
              target="_blank"
              rel="noopener noreferrer"
              className="relative"
            >
              Sign In
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
