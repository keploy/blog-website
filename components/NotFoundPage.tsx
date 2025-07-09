import React from "react";
import Header from "./header";
import Container from "./container";

const NotFoundPage = () => {
  return (
    <>
      <Header />
      <Container>
        <div className="flex flex-col items-center justify-center">
          <p>Page not found</p>
          <h1 className="text-[65px] sm:text-[85px] font-normal text-[#757575]">404</h1>
          <p className="text-[18px]">
            Oops! The page you are looking for does not exist or has been moved.
          </p>
        </div>
      </Container>
    </>
  );
};

export default NotFoundPage;
