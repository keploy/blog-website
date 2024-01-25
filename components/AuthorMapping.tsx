export default function AuthorMapping({
    AuthorArray
}){
    const UpdatedArray = [];
    AuthorArray.forEach((item) => {
        if (item.includes(',')) {
          const authors = item.split(',').map((author) => {
            return author
              .toLowerCase()
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
              .trim();
          });
          UpdatedArray.push(...authors);
        } else {
          const updatedAuthor = item
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .trim();
          UpdatedArray.push(updatedAuthor);
        }
      });
      
      // Remove duplicates
      const newSetTemp = new Set(UpdatedArray);
      const UpdateAuthors = Array.from(newSetTemp);

    return(
        UpdateAuthors.map((name,index)=>{
           return (
            <div key={index}
            className="bg-white p-6 rounded-lg shadow-md mb-4">
                <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
                    {name}</h2>
            <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            View Posts
          </button>
            </div>
                )

        })
    )
}