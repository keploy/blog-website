import Image from "next/image";
import waitlistBannerImage from "../public/images/waitlistedBanner-1.svg";
import Link from "next/link";
const waitlistBanner = () => {
  return (
    <div className="flex flex-col rounded-xl">
        <Link
          className="border border-black w-fit bg-white text-black text-base p-2 font-semibold rounded-md shadow-md hover:shadow-none shadow-neutral-950  mt-4"
          href="https://app.keploy.io/signin"
          target="_blank"
        >
          {" "}
          <Image
          className="rounded-tl-xl w-full"
          alt="Description of Image"
          src={waitlistBannerImage}
        />
        </Link>
    </div>
  );
};
export default waitlistBanner;
