import Image from "next/image";
import { Post } from "../types/post";
export default function Avatar({ author, overrideClassName = false, className }: { author: Post["ppmaAuthorName"], overrideClassName?: boolean, className?: string }) {
  // const isAuthorHaveFullName = author?.node?.firstName && author?.node?.lastName
  // const name = isAuthorHaveFullName
  //   ? `${author.node.firstName} ${author.node.lastName}`
  //   : author.node.name || null
  return (
    <div className={`${overrideClassName ? className : "flex items-center text-[#190F36]"}`}>
      {/* <div className="w-8 h-8 relative mr-4">
        <Image
          src={author.node.avatar.url}
          layout="fill"
          className="rounded-full"
          alt={name}
        />
      </div> */}
      <div className="text-md font-medium heading1">{author}</div>
    </div>
  );
}
