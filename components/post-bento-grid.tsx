const PostBentoGrid = ({ children }) => {
  return (
    <div
      className="
        grid 
        grid-cols-1 
        md:grid-cols-2 
        lg:grid-cols-3 
        gap-6 
        auto-rows-[260px]
      "
    >
      {children}
    </div>
  );
};

export default PostBentoGrid;
