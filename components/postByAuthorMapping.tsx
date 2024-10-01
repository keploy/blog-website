import React from "react";
import Image from "next/image";
import { Post } from "../types/post";
import Link from "next/link";
import { animated, useInView, easings } from "@react-spring/web";
import dynamic from "next/dynamic";
 
const AuthorDescription = dynamic(() => import("./author-description"), {
  ssr: false,
})

function Node({ node }) {
  const [cardRef, cardSpringStyles] = useInView(
    () => ({
      from: {
        opacity: 0,
      },
      to: {
        opacity: 100,
      },
      config: {
        duration: 500,
        delay: 100,
        easing: easings.easeInCubic,
      },
    }),
    {
      rootMargin: "-200px 0px",
    }
  );
  return (
    <animated.li className="mb-8" ref={cardRef} style={cardSpringStyles}>
      <Link href={`/${node.categories.edges[0].node.name}/${node.slug}`}>
        <div className="px-5 py-4  transition-colors duration-300 ease-in-out transform border border-transparent rounded-lg group hover:scale-105 hover:border-accent-2 hover:dark:bg-neutral-400/30">
          <div className="flex items-center justify-between">
            <h2 className="mb-2 mr-4 text-lg font-bold sm:text-xl text-slate-600">
              {node.title}
            </h2>
          </div>
          <Image
            src={node.featuredImage?.node?.sourceUrl}
            alt={node.title}
            className="object-cover w-full h-32 mb-4 rounded-md"
            height={200}
            width={200}
          />
          <p className="mb-2 text-gray-400">Author: {node.postAuthor}</p>
          <p className="mb-4 text-gray-500">
            Category: {node.categories.edges[0].node.name}
          </p>
          {/* Additional details can be added based on your needs */}
        </div>
      </Link>
    </animated.li>
  );
}

const PostByAuthorMapping = ({
  filteredPosts,
  Content,
}: {
  filteredPosts: { node: Post }[];
  Content: string;
}) => {
  const AuthorName = filteredPosts[0].node.postAuthor;
  return (
    <div className="container mx-auto mt-8">
      <div className="mb-5">
        <AuthorDescription
          authorData={Content}
          AuthorName={AuthorName}
          isPost={false}
        />
      </div>
      <h1 className="text-xl sm:text-3xl lg:text-4xl mt-10 font-bold mb-8 text-slate-900 bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom  tracking-tighter leading-tight w-max">
        Posts by {AuthorName}
      </h1>
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredPosts.map(({ node }) => {
          return <Node node={node} key={node.slug} />;
        })}
      </ul>
    </div>
  );
};

export default PostByAuthorMapping;
