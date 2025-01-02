import React, { useState, useEffect } from "react";
import { FaRegPlayCircle } from "react-icons/fa";
import { FaRegCirclePause } from "react-icons/fa6";

const BlogReader = ({ content, timetoRead, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speech, setSpeech] = useState(null);

  const stripHTML = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const handlePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const plainTextContent = stripHTML(content);
    const filteredContent = plainTextContent.replace(
      /Table of Contents.*?(?=\n|$)/,
      ""
    ); // Remove Table of Contents section
    const speechText = `${title}. ${filteredContent}`;

    const newSpeech = new SpeechSynthesisUtterance(speechText);
    newSpeech.lang = "en-US";
    newSpeech.rate = 1;
    newSpeech.pitch = 1;

    newSpeech.onend = () => {
      setIsPlaying(false);
      setSpeech(null);
    };

    setIsPlaying(true);
    setSpeech(newSpeech);
    window.speechSynthesis.speak(newSpeech);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        window.speechSynthesis.pause();
      } else if (!document.hidden && isPlaying) {
        window.speechSynthesis.resume();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-row gap-3 items-center justify-center">
      <button onClick={handlePlay} className="text-xl">
        {isPlaying ? <FaRegCirclePause /> : <FaRegPlayCircle />}
      </button>
      <p className="text-gray-500 justify-self-start text-sm">
        {timetoRead} min read
      </p>
    </div>
  );
};

export default BlogReader;
