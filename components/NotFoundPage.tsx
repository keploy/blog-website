import React from "react";
import Header from "./header";
import Container from "./container";

const NotFoundPage = () => {
  return (
    <>
      <Header />
      <Container>
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🐰Oops!🐰</h1>
          <p className="text-lg text-gray-600 mb-8">404 - Page not Found</p>

          <div className="flex items-center justify-center">
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
