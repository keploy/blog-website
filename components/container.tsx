export default function Container({ children }) {
  // return <div className="container mx-auto px-5">{children}</div>
  return <div className="max-w-7xl mx-auto px-5 sm:px-6">{children}</div>;
}
