import Image from "next/image";
import waitlistBannerImage from "../public/images/waitlistedBanner-1.svg";
import Link from "next/link";
const waitlistBanner = () => {
  return (
    <div className="flex md:items-center flex-col rounded-xl">
        <Link
          className="border border-black w-fit bg-white text-black text-base p-2 font-semibold rounded-md shadow-md sticky hover:shadow-none shadow-neutral-950  mt-4"
          href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2l-psdTCNCLYAJ-Jt5ESyGP7gi1_U70ySTjtFNr0Kmx5UagNJnyzg7lNjA3NKnaP6qFfpAgcdZ"
          target="_blank"
        >
          {" "}
          <Image
          className="rounded-tl-xl w-full !h-[350px]"
          alt="Description of Image"
          src={waitlistBannerImage}
        />
        </Link>
    </div>
  );
};
export default waitlistBanner;
