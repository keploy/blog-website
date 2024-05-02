import Image from "next/image";
import waitlistBannerImage from "../public/images/waitlistBannerImage.png"
const waitlistBanner =()=>{
    return  (
        <div className="flex flex-col bg-hero-gradient rounded-xl">
          <div className="overflow-x-hidden py-6 px-6 flex flex-col w-full" >
          <span className="text-black font-semibold  text-2xl">Get to 90% coverage fast? Try record-replay testing!</span>
          <a className="border border-black w-fit bg-white text-black text-base p-2 font-semibold rounded-md shadow-md mt-4" href=""> Join the Waitlist</a>

          </div>
          <div className="pl-6 w-full">
          <Image   className="rounded-tl-xl w-full"
    alt="Description of Image" src={waitlistBannerImage}/>
          </div>
        </div>
    
      );
}
export default waitlistBanner