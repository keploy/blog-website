import Link from "next/link";
import { Tag as TagInterface } from "../types/tag";
// import AdSlot from "./Adslot";
import { getIconComponentForTag } from "../utils/tagIcons";
import AdSlot from "./Adslot";

// Color palette with good contrast - inspired by the design reference
const COLOR_VARIANTS = [
  'bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200',
  'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200',
  'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200',
  'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200',
  'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200',
  'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200',
  'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200',
  'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200',
];

export default function Tag({
  tags,
}: {
  tags: {
    edges: TagInterface[];
  };
}) {
  const renderTagButton = (name: string, prevIconName?: string) => {
    const IconComp = getIconComponentForTag(name, prevIconName) as any;

    // Use tag name to consistently assign colors
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLOR_VARIANTS.length;
    const classes = COLOR_VARIANTS[colorIndex];

    return { IconComp, classes };
  };

  return (
    <div className="max-w-2xl mx-auto">
      <p className="mt-8 text-lg font-bold">Tags</p>
      <div className="flex flex-wrap mt-2">
        {tags.edges.map((tag, index) => {
          const name = tag.node.name;
          const prev = index > 0 ? tags.edges[index - 1].node.name : undefined;
          const { IconComp, classes } = renderTagButton(name, prev as string | undefined);
          return (
            <Link key={index} href={`/tag/${name}`}>
              <button
                className={`inline-flex items-center ${classes} font-medium py-2 mr-2 mb-2 px-4 rounded-lg transition-colors`}
                aria-label={`Open tag ${name}`}
              >
                <IconComp className="mr-2" />
                {name}
              </button>
            </Link>
          );
        })}
        <div className="w-full flex justify-center my-8 -mb-20">
          <AdSlot
            slotId="3587179144"
            className="w-full max-w-[728px] h-[90px]"
          />
        </div>

      </div>
    </div>
  );
}

