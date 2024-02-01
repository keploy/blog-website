export default function PostByAuthorMapping(
   filteredPosts
){
    return(
        <div>
            {filteredPosts.map((node)=>{
                <h1>{node.title}</h1>
            })}
        </div>
    )
}