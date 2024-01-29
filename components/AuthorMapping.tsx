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
      <div key={index} className="bg-gradient-to-r from-blue-200 to-purple-100 p-6 rounded-lg shadow-md mb-4 border-2 border-blue-100">
        <div className="flex items-center">
          <img
            src={author.avatarUrl}
            alt={`${author.ppmaAuthorName}'s Avatar`}
            className="w-15 h-15 rounded-full mr-4 "
          />
          <h2 className="bg-gradient-to-r from-blue-200 to-purple-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px] text-2xl font-mono text-blue-800">
            {author.ppmaAuthorName}
          </h2>
        </div>
        <button className="bg-gradient-to-r from-blue-200 to-purple-100 text-purple px-4 py-2 rounded shadow-md mt-2 hover:bg-gradient-to-r hover:from-purple-200 hover:to-blue-100 hover:ease-in duration-500 text-2xl font-mono text-blue-800">
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

