import React from 'react'

const Tweets = ({avatar, id, content}) => {
  return (
    <>
        <div className="bg-gray-100 border p-6 rounded-md lg:hover:shadow-md transition m-1">
            <div className="flex flex-row gap-2 items-center">
                <img src={avatar} alt="profile_image" className="rounded-full h-12"/>
                <div className="font-bold">@{id}</div>
            </div>
            <div className="pt-2">{content}</div>
            <div className=""></div>
        </div>
    </>
  )
};

export default Tweets;
