import Link from "next/link";
import { Card } from "../ui/card";
import Image, { StaticImageData } from "next/image";

interface DevResourceCardProps {
  title: string;
  subtitle?: string;
  href: string;
  icon?: StaticImageData;
  badge?: string;
  backgroundImage?: string | StaticImageData;
}

export function InfoCardBlock({
  title,
  subtitle,
  href,
  icon,
  badge,
  backgroundImage,
}: DevResourceCardProps) {
  return (
    <div className="transition-transform duration-300 ease-in-out hover:scale-[1.01] w-full h-full">
      <div className="relative h-full w-full rounded-xl p-[1.5px] bg-gradient-to-r from-[#FF7A0C] to-[#FFA74F]/[0.36]">
        <Link
          href={href}
          className="block w-full h-full relative bg-[#fffcfa] rounded-2xl overflow-hidden"
        >
          {backgroundImage && (
            <Image
              src={backgroundImage}
              alt={`${title} background`}
              fill
              className="absolute inset-0 z-0 object-cover transition-transform duration-300"
            />
          )}

          <div className="h-full w-full overflow-hidden rounded-[calc(0.75rem-3px)]">
            <Card className="relative z-10 h-full px-4 py-4 flex flex-col justify-between bg-muted/10 overflow-hidden rounded-[calc(0.75rem-3px)]">
              <div className="space-y-1">
                {badge && (
                  <span className="inline-block text-[.75em] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md">
                    {badge}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h4 className="text-base font-medium text-gray-900/80">
                      {title}
                    </h4>
                    {subtitle && (
                      <p className="text-[.75em] text-[#737373]">{subtitle}</p>
                    )}
                  </div>

                  {icon && (
                    <div className="self-start w-6 h-6 overflow-hidden rounded-md flex items-center justify-center">
                      <Image
                        src={icon}
                        width={24}
                        height={24}
                        alt={title}
                        className="object-contain max-w-full max-h-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </Link>
      </div>
    </div>
  );
}
