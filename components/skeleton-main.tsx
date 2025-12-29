import { motion } from "framer-motion";

export default function Skeleton() {
  return (
    <motion.div
      className="p-8 px-30 animate-pulse min-h-screen space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Navbar */}
      <div className="w-full bg-gray-100 flex px-35 justify-between absolute top-0 left-0 py-4 px-30">
        <div className="flex gap-5">
          <div className="w-20 h-8 bg-white rounded-full"></div>
        </div>
        <div className="flex gap-5"></div>
      </div>

      {/* Hero Section */}
      <div className="home-container flex flex-col-reverse lg:flex-row-reverse justify-center items-center gap-8 min-h-screen">
        {/* Right Image*/}
        <div className="blog-hero-img flex-1 order-1 lg:order-none">
          <div className="h-96 w-full bg-gray-300 rounded-lg "></div>
        </div>

        {/* Left Content */}
        <div className="content space-y-6 flex-1 order-2 lg:order-none">
          <div className="h-12 bg-gray-300 rounded w-3/4"></div>
          <div className="h-6 bg-gray-300 rounded w-full"></div>
          <div className="h-6 bg-gray-300 rounded w-5/6"></div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <div className="h-10 w-32 bg-gray-300 rounded-xl"></div>
            <div className="h-10 w-32 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>

      {/* Top Blogs Section */}
      <div className="space-y-4 min-h-screen mt-15">
        <section className="py-12 px-30 md:px-8 lg:px-16 animate-pulse">
          {/* ====================== TECHNOLOGY SECTION ====================== */}
          <div className="mb-16 md:px-8 lg:px-32">
            {/* Heading */}
            <div className="h-10 w-80 bg-gray-200 rounded-md mb-10"></div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>

            {/* CTA */}
            <div className="mt-6 flex justify-end">
              <div className="h-5 w-56 bg-gray-200 rounded-md"></div>
            </div>
          </div>

          {/* ====================== COMMUNITY SECTION ====================== */}
          <div className="lg:px-32 md:px-8">
            {/* Heading */}
            <div className="h-10 w-96 bg-gray-200 rounded-md mb-10"></div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>

            {/* CTA */}
            <div className="mt-6 flex justify-end">
              <div className="h-5 w-56 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </section>
      </div>

      {/* Testimonials Section */}
      <div className="space-y-4 min-h-screen lg:px-35 md:px-8 mt-15">
        <div className="animate-pulse">
          {/* Heading */}
          <h3 className="text-center lg:text-left h-10 w-80 bg-gray-200 rounded-md mb-6 mt-16 lg:px-32"></h3>

          {/* Container */}
          <div className="relative flex lg:mx-40 md:mx-8 mb-8 h-[700px] flex-col items-center justify-center overflow-hidden rounded-lg border bg-white">
            {/* First Marquee Row */}
            <div className="flex gap-6 py-4 animate-marquee">
              {[...Array(3)].map((_, i) => (
                <SkeletonReviewCard key={i} />
              ))}
            </div>

            {/* Second Marquee Row (reverse) */}
            <div className="flex gap-6 py-4 animate-marquee-reverse">
              {[...Array(3)].map((_, i) => (
                <SkeletonReviewCard key={i} />
              ))}
            </div>

            {/* Gradient overlays */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-neutral-100"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-neutral-100"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full h-80 bg-gray-100 flex px-35 justify-between absolute top-0 left-0 py-4 px-30"></div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="border rounded-xl shadow-sm p-3 sm:p-4 bg-white w-full">
      {/* Image */}
      <div className="h-36 sm:h-40 w-full bg-gray-200 rounded-md mb-4"></div>

      {/* Title */}
      <div className="h-4 w-3/4 bg-gray-200 rounded-md mb-3"></div>

      {/* Excerpt */}
      <div className="h-3 w-full bg-gray-200 rounded-md mb-2"></div>
      <div className="h-3 w-5/6 bg-gray-200 rounded-md mb-2"></div>
      <div className="h-3 w-4/6 bg-gray-200 rounded-md mb-4"></div>

      {/* Footer */}
      <div className="h-3 w-28 sm:w-32 bg-gray-200 rounded-md"></div>
    </div>
  );
}

function SkeletonReviewCard() {
  return (
    <div className="w-[240px] sm:w-[280px] max-w-full h-40 sm:h-48 bg-white border rounded-xl shadow-sm p-3 sm:p-4 flex flex-col gap-3">
      {/* User Row */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>

        <div className="flex flex-col">
          <div className="h-4 w-24 sm:w-28 bg-gray-200 rounded-md mb-1"></div>
          <div className="h-3 w-16 sm:w-20 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      {/* Review Text */}
      <div className="h-3 w-full bg-gray-200 rounded-md"></div>
      <div className="h-3 w-4/5 bg-gray-200 rounded-md"></div>
      <div className="h-3 w-3/5 bg-gray-200 rounded-md"></div>
    </div>
  );
}
