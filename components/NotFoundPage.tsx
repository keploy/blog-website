import React from "react";
import Header from "./header";
import Container from "./container";
import error from "../public/images/error404.png";
import Image from "next/image";
const NotFoundPage = () => {
  return (
    <>
      <Header />
      <Container>
        <div className="flex flex-col items-center justify-center">
          <Image src={error} width={500} height={500} alt="error" />
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            🐰Oops!🐰
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            404 - Page not Found
          </p>

          <div className="flex items-center justify-center dark:text-white">
            <span className="mr-1">Redirecting</span>
            <div className="flex space-x-1">
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default NotFoundPage;
