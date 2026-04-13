import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { IoLogoLinkedin } from "react-icons/io5";

interface AuthorHeroProps {
  name: string;
  avatarUrl: string;
  description: string;
  linkedIn?: string;
}

const AuthorHero: React.FC<AuthorHeroProps> = ({
  name,
  avatarUrl,
  description,
  linkedIn,
}) => {
  const resolvedAvatar = !avatarUrl || avatarUrl === "n/a" ? "/blog/images/author.png" : avatarUrl;

  // Only show social links that actually exist
  const socialSlots = [linkedIn].filter(link => link && link !== "n/a");

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative mb-16 py-8 px-4 sm:px-0 bg-transparent overflow-hidden"
    >
      <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-8 md:gap-16">
        {/* Left Column — Avatar + Social Icons */}
        <div className="flex flex-col items-center flex-shrink-0">
          {/* Avatar - Bigger size */}
          <div className="relative w-[200px] h-[200px] md:w-[220px] md:h-[220px] rounded-full border-[3px] border-orange-400 p-1 bg-white shadow-sm overflow-hidden">
            <Image
              src={resolvedAvatar}
              alt={name}
              width={220}
              height={220}
              className="rounded-full object-cover aspect-square"
              priority
            />
          </div>

          {/* Social Icons — below avatar, only show existing ones */}
          {socialSlots.length > 0 && (
            <div className="flex items-center gap-4 mt-6">
              {socialSlots.map((link, i) => (
                <Link
                  key={`social-${i}`}
                  href={link!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-11 h-11 rounded-full bg-gray-100 text-[#637277] shadow-sm hover:bg-[#0077B5] hover:text-white hover:shadow-md transition-all duration-300"
                >
                  <IoLogoLinkedin className="w-5 h-5" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column — Name + Description */}
        <div className="flex-1 pt-2">
          <h1
            className="mb-5"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "40px",
              lineHeight: "48px",
              fontWeight: 700,
              color: "rgb(29, 32, 34)",
            }}
          >
            {name}
          </h1>

          {description && description !== "n/a" && (
            <div
              className="max-w-2xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "20px",
                lineHeight: "32px",
                fontWeight: 400,
                color: "rgb(99, 114, 119)",
              }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default AuthorHero;
