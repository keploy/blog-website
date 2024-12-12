import React, { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const PostLike = () => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const toggleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(likeCount - 1);
    } else {
      setLiked(true);
      setLikeCount(likeCount + 1);
    }
  };

  return (
    <div>
      {" "}
      <div
        className="flex flex-col items-center justify-center cursor-pointer"
        onClick={toggleLike}
      >
        <p className="text-xl">{liked ? <FaHeart /> : <FaRegHeart />}</p>
        <p className="text-sm text-gray-500">
          {likeCount} {likeCount === 1 ? "Like" : "Likes"}
        </p>
      </div>
    </div>
  );
};

export default PostLike;
