import React from "react";
import Image from "next/image";
const PostHeaderAuthors = ({ blogwriter, blogreviewer }) => {
    var sameAuthor = blogwriter[0].name === blogreviewer[0].name;

  return (
    <div className="flex flex-row my-7 items-center gap-20">
      {/* <Image src={blogwriter[0].ImageUrl} alt='blog-writer' height={50} width={50}/> */}
      <div className="flex flex-row items-center gap-5">
      <Image
          src={blogwriter[0].ImageUrl}
          alt="blog-writer"
          height={50}
          width={50}
          className="rounded-full"
        />
        <p>
          <span className=" text-gray-500"> Written By:</span> <br />{" "}
          <span className=" font-semibold">{blogwriter[0].name}</span>
        </p>{" "}
      </div>
      {!sameAuthor && <div className="flex flex-row items-center gap-5">
        <Image
          src={blogreviewer[0].ImageUrl}
          alt="blog-writer"
          height={50}
          width={50}
          className="rounded-full"
        />
        <p>
          <span className=" text-gray-500"> Reviewed By:</span> <br />{" "}
          <span className=" font-semibold">{blogreviewer[0].name}</span>
        </p>
      </div>}
    </div>
  );
};

export default PostHeaderAuthors;
