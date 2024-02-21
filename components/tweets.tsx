import React from 'react'

const Tweets = ({avatar, name, id, post, content}) => {
  return (
    <>
        <a className="bg-gray-100 border p-6 rounded-md lg:hover:shadow-md transition m-1" href={post}>
            <div className="flex flex-row gap-2 items-center">
                <img src={avatar} alt="profile_image" className="rounded-full h-12"/>
                <div className="flex flex-col justify-center">
                  <div className="font-bold">{name}</div>
                  <div className="">@{id}</div>
                </div>
            </div>
            <div className="pt-2">{content}</div>
            <div className=""></div>
        </a>
    </>
  )
};

export default Tweets;