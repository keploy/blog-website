import Image from "next/image";
import React, { useState } from "react";
import { FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";

const PostComment = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "User Name",
      avatar: "/user-placeholder.jpg",
      content: "This is a sample comment.",
      likes: 5,
      date: "2 days ago",
      showReplyBox: false,
      replies: [],
      liked: false,
    },
  ]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLike = (commentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
              liked: !comment.liked,
            }
          : comment
      )
    );
  };
  const toggleReplyBox = (commentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? { ...comment, showReplyBox: !comment.showReplyBox }
          : comment
      )
    );
  };

  const handleReply = (commentId, replyContent) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [...comment.replies, { content: replyContent }],
              showReplyBox: false,
            }
          : comment
      )
    );
  };

  return (
    <div>
      <div
        className="flex flex-col items-center justify-center cursor-pointer"
        onClick={toggleMenu}
      >
        <p className="text-xl">
          <FaRegComment />
        </p>
        <p className="text-sm text-gray-500">Comment</p>
      </div>

      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-lg transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Responses</h2>
          <button
            className="text-gray-600 hover:text-gray-900"
            onClick={toggleMenu}
          >
            &times;
          </button>
        </div>

        <div className="m-4 shadow-md rounded-md">
          <div className="flex items-center space-x-3 px-3 pt-3">
            <Image
              src={`https://ui-avatars.com/api/?name=JohnDoe&background=random&size=128`}
              width={32}
              height={32}
              alt="User"
              className="rounded-full"
            />
            <div className="text-sm font-bold">
              <p>John Doe</p>
            </div>
          </div>
          <textarea
            placeholder="what is your thoughts?"
            className="w-full h-[100px] p-3 focus:outline-none placeholder:text-sm text-sm mt-3"
          />
          <div className="flex flex-row-reverse p-3">
            <div className="flex items-center space-x-4">
              <button className="text-sm">Cancel</button>
              <button className="text-sm px-4 py-[6px] bg-primary-300 rounded-full text-white">
                Comment
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-10rem)]">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b pb-4">
              <div className="flex items-center gap-3">
                <Image
                  src={`https://ui-avatars.com/api/?name=JohnDoe&background=random&size=128`}
                  alt={comment.user}
                  className=" rounded-full"
                  width={32}
                  height={32}
                />
                <div>
                  <p className="text-sm font-bold">{comment.user}</p>
                  <p className="text-xs text-gray-500">{comment.date}</p>
                </div>
              </div>
              <p className="mt-2 text-md text-gray-700">{comment.content}</p>
              <div className="flex gap-4 text-xs text-gray-500 mt-2">
                <button
                  className="flex items-center gap-1"
                  onClick={() => handleLike(comment.id)}
                >
                  {comment.liked ? <FaHeart /> : <FaRegHeart />} {comment.likes}
                </button>
                <button
                  className="flex items-center gap-1"
                  onClick={() => toggleReplyBox(comment.id)}
                >
                  <FaRegComment /> Reply
                </button>
              </div>
              {comment.showReplyBox && (
                <div className="mt-2 animate-slideDown">
                  <textarea
                    placeholder="Reply Here!"
                    className="w-full h-[30px] p-3 focus:outline-none placeholder:text-sm text-sm mt-2"
                  />
                  <div className="flex flex-row-reverse p-3">
                    <div className="flex items-center space-x-4">
                      <button
                        className="text-sm"
                        onClick={() => toggleReplyBox(comment.id)}
                      >
                        Cancel
                      </button>
                      <button
                        className="text-sm px-4 py-[6px] bg-primary-300 rounded-full text-white"
                        onClick={() =>
                          handleReply(comment.id, "Sample reply content")
                        }
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {comment.replies.length > 0 && (
                <div className="mt-4 pl-6 space-y-2 border-l">
                  {comment.replies.map((reply, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      {reply.content}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostComment;
