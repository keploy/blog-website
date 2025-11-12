import Link from "next/link";
import { Card, CardContent } from "../ui/card";
import Image, { StaticImageData } from "next/image";

interface InfoCardProps {
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
}: InfoCardProps) {
  return (
    <Link
      href={href}
      className="group block w-full h-full"
      rel="noopener noreferrer"
    >
      <div className="relative h-full w-full rounded-xl p-[1.5px] hover:p-[2px] bg-gradient-to-r from-[#FF7A0C] to-[#FFA74F]/[0.36] transition-all duration-200">
        <Card className="relative h-full w-full overflow-hidden rounded-[calc(0.75rem-3px)] bg-card shadow-[0_6px_14px_rgba(0,0,0,0.10)] group-hover:shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition-shadow duration-200">
          <CardContent className="relative w-full h-full p-0">
            {backgroundImage && (
              <Image
                src={backgroundImage}
                alt={`${title} background`}
                fill
                className="object-cover w-full h-full transition-all duration-300"
                priority
              />
            )}

            <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 bg-white/10 rounded-[calc(0.75rem-3px)]">
              <div className="flex flex-col gap-1">
                {badge && (
                  <span className="inline-block text-[.75em] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md w-fit">
                    {badge}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h4 className="text-base font-medium text-gray-900/80 truncate">
                      {title}
                    </h4>
                    {subtitle && (
                      <p className="text-[.75em] text-[#737373] truncate">
                        {subtitle}
                      </p>
                    )}
                  </div>
                  {icon && (
                    <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}
