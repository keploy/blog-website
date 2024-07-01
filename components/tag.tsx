import Link from "next/link";
import { Tag as TagInterface } from "../types/tag";
export default function Tag({
  tags,
}: {
  tags: {
    edges: TagInterface[];
  };
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <p className="mt-8 text-lg font-bold">Tagged</p>
      <div className="flex flex-wrap mt-2">
        {tags.edges.map((tag, index) => (
          <Link key={index} href={`/tag/${tag.node.name}`}>
            <button className="bg-slate-200 hover:bg-slate-300 text-slate-500 font-bold py-2 mr-2 mb-2 px-4 rounded">
              {tag.node.name}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
