import Image from "next/image";
import waitlistBannerImage from "../public/images/waitlistBannerImage.png";
import Link from "next/link";
const waitlistBanner = () => {
  return (
    <div className="flex flex-col bg-hero-gradient rounded-xl">
      <div className="overflow-x-hidden py-6 px-6 flex flex-col w-full">
        <span className="text-black font-semibold  text-2xl">
          Get to 90% coverage fast? <br className="hidden lg:block" />
          Try record-replay testing!
        </span>
        <Link
          className="border border-black w-fit bg-white text-black text-base p-2 font-semibold rounded-md shadow-md mt-4"
          href="https://docs.google.com/forms/d/e/1FAIpQLSdj9q7dyRh3D7ZzRExHLWRRkNPOnLnFfrbKqSwqH3Ur4HzP4g/viewform"
          target="_blank"
        >
          {" "}
          Join the Waitlist
        </Link>
      </div>
      <div className="pl-6 w-full">
        <Image
          className="rounded-tl-xl w-full"
          alt="Description of Image"
          src={waitlistBannerImage}
        />
      </div>
    </div>
  );
};
export default waitlistBanner;
