import Link from "next/link";

export default function AuthorMapping({
  AuthorArray
}) {
  const authorData = [];
  const ppmaAuthorNameArray = [];
  const slugArray = [];
  AuthorArray.forEach((item) => {
    const ppmaAuthorName = formatAuthorName(item.ppmaAuthorName);
    const avatarUrl = item.author.node.avatar.url;
    const slug  = item.ppmaAuthorName;

    if(Array.isArray(ppmaAuthorName)){
      return;
    }

    if(!ppmaAuthorNameArray.includes(ppmaAuthorName)) {
      ppmaAuthorNameArray.push(ppmaAuthorName);
    } else {
      return;
    }   

    authorData.push({
      ppmaAuthorName,
      avatarUrl,
      slug
    });
  });
  
  return (
    authorData.map((author, index) => (
      <div key={index} className="bg-darkBlue p-3 rounded-lg ml-2 md:ml-4 lg:ml-8 xl:ml-12  mt-5 mb-5 flex flex-col sm:flex-row justify-between">
        <div className="flex items-center mb-3 sm:mb-0">
          <img
            src={author.avatarUrl}
            alt={`${author.ppmaAuthorName}'s Avatar`}
            className="w-15 h-15 rounded-full mr-3 sm:mr-6"
          />
          <h2 className="text-xl font-sans font-bold text-slate-300">
            {author.ppmaAuthorName}
          </h2>
        </div>
        <Link href={`/authors/${author.slug}`}>
          <button className="bg-gradient-to-r from-blue-200 to-purple-100 text-purple px-2 py-2 rounded-2xl shadow-md mt-2 sm:mt-0 hover:bg-gradient-to-r hover:from-purple-200 hover:to-blue-100 hover:ease-in duration-500 text-sm text-blue-800">
            View Posts 
          </button>
        </Link>
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
