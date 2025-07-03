import React from "react";
import Header from "./header";
import Container from "./container";

const NotFoundPage = () => {
  return (
    <>
      <Header />
      <Container>
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-[#F45D2B] text-[100px] font-bold">404</h1>
          <h3 className="text-[#312E81] text-[40px] font-bold">
            Page Not Found
          </h3>
          <p className="text-[#5E6672] text-[18px]">
            Oops! The page you are looking for does not exist or has been moved.
          </p>
        </div>
      </Container>
    </>
  );
};

export default NotFoundPage;
