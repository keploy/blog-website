export default function Avatar({ author }) {
  // const isAuthorHaveFullName = author?.node?.firstName && author?.node?.lastName
  // const name = isAuthorHaveFullName
  //   ? `${author.node.firstName} ${author.node.lastName}`
  //   : author.node.name || null
  return (
    <div className="flex items-center">
      {/* <div className="w-8 h-8 relative mr-4">
        <Image
          src={author.node.avatar.url}
          layout="fill"
          className="rounded-full"
          alt={name}
        />
      </div> */}
      <div className="text-md font-medium heading1">{author}</div>
    </div>
  )
}
