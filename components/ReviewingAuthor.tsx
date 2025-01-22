import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
const ReviewingAuthor = ({ name, avatar, description }) => {
  const [showMore, setShowMore] = useState(false);
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const FormatDescription = (description) => {
    if (description==null) {
      return {    
        description: 'Writer at keploy publication.'
      };
    };
    const des = description.split(". ");
    const len = des.length;
    return {
      newAuthorDescription: des,
      length: len,
    };
  };
  const { newAuthorDescription, length } = FormatDescription(description);

  return (
    <>
      <div className="max-w-9xl mx-auto bg-slate-000 shadow-md rounded-lg overflow-hidden flex flex-col sm:flex-row md:flex-row lg:flex-row">
        <div className="w-3/5 self-center sm:w-1/4 p-8 flex justify-center items-center">
          {avatar !== "n/a" && (
            <Image
              src={avatar}
              alt="Author Avatar"
              width={200}
              height={200}
              className="object-cover rounded-full sm:h-30 sm:w-30 aspect-square"
              priority
            />
          )}
          {avatar === "n/a" && (
            <Image
              src={"/blog/images/author.png"}
              alt="Author Avatar"
              width={200}
              height={200}
              className="object-cover rounded-full sm:h-30 sm:w-30 aspect-square"
              priority
            />
          )}
        </div>

        <div className="w-full sm:w-2/3 p-8">
          <div className="heading1 uppercase tracking-wide text-base text-black font-semibold">
            Reviewer Details
          </div>
          <div className="list-disc mt-2 text-gray-600 heading1">
            <div className="mb-2">
              <span className="font-semibold">Reviewer Name:</span> {name}
            </div>
            <div>
              <span className="font-semibold">Reviewer Description:</span>{" "}
              {length > 0 ? (
                newAuthorDescription.map((item, index) => (
                  <li
                    key={index}
                    className={
                      !showMore && index >= 1 ? " ml-5 hidden" : "ml-5"
                    }
                  >
                    {item}
                  </li>
                ))
              ) : (
                <span className="text-gray-600">A reviewer for Keploy</span>
              )}
              {!showMore && length > 2 && newAuthorDescription.length && (
                <button
                  onClick={toggleShowMore}
                  className=" text-slate-500 hover:underline mt-1"
                >
                  Show more
                </button>
              )}
              {showMore && (
                <button
                  onClick={toggleShowMore}
                  className="text-slate-400 focus:outline-none hover:underline  mt-1"
                >
                  Show less
                </button>
              )}
            </div>

            <div className="mt-2  flex justify-end">
              <button className="text-slate-100 place-self-end focus:outline-none hover:bg-slate-800 hover:text-slate-50 bg-slate-500 p-2 rounded-lg mt-1">
                <Link href={`/authors/${name}`}>View All Posts</Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewingAuthor;
