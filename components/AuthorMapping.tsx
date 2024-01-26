export default function AuthorMapping({
  AuthorArray
}) {
  const authorData = [];
  const ppmaAuthorNameArray = [];

  AuthorArray.forEach((item) => {
    const ppmaAuthorName = formatAuthorName(item.ppmaAuthorName);
    
    // Assuming 'author' property exists and has 'node' and 'avatar' properties
    const avatarUrl = item.author.node.avatar.url;


    if(Array.isArray(ppmaAuthorName)){
      return;
    }

   if(!ppmaAuthorNameArray.includes(ppmaAuthorName)) {
      ppmaAuthorNameArray.push(ppmaAuthorName);
    }else{
      return;
    }   


    authorData.push({
      ppmaAuthorName,
      avatarUrl
    });
  });
  
  return (
    authorData.map((author, index) => (
      <div key={index} className="bg-white p-6 rounded-lg shadow-md mb-4">
        <div className="flex items-center">
          <img
            src={author.avatarUrl}
            alt={`${author.ppmaAuthorName}'s Avatar`}
            className="w-10 h-10 rounded-full mr-4"
          />
          <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
            {author.ppmaAuthorName}
          </h2>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
          View Posts 
        </button>
      </div>
    ))
  );
}

function formatAuthorName(name) {
  if (name.includes(',')) {
    const authors = name.split(',').map((author) => {
      return author
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .trim();
    });
    return authors;
  } else {
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .trim();
  }
}
