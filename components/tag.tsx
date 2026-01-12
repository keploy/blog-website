import Link from "next/link";
import { Tag as TagInterface } from "../types/tag";
import { getIconComponentForTag } from "../utils/tagIcons";

// 20 distinct VIBRANT colors - MORE SATURATED to avoid white appearance
const TAG_COLORS = [
  // Warm colors - DARKER & MORE VIBRANT
  {
    bg: "bg-gradient-to-br from-rose-200 to-rose-100",
    hover: "hover:from-rose-300 hover:to-rose-200",
    text: "text-rose-800",
    border: "border-rose-300",
    shadow: "hover:shadow-rose-300/50",
  },
  {
    bg: "bg-gradient-to-br from-red-200 to-red-100",
    hover: "hover:from-red-300 hover:to-red-200",
    text: "text-red-800",
    border: "border-red-300",
    shadow: "hover:shadow-red-300/50",
  },
  {
    bg: "bg-gradient-to-br from-orange-200 to-orange-100",
    hover: "hover:from-orange-300 hover:to-orange-200",
    text: "text-orange-800",
    border: "border-orange-300",
    shadow: "hover:shadow-orange-300/50",
  },
  {
    bg: "bg-gradient-to-br from-amber-200 to-amber-100",
    hover: "hover:from-amber-300 hover:to-amber-200",
    text: "text-amber-800",
    border: "border-amber-300",
    shadow: "hover:shadow-amber-300/50",
  },
  {
    bg: "bg-gradient-to-br from-yellow-200 to-yellow-100",
    hover: "hover:from-yellow-300 hover:to-yellow-200",
    text: "text-yellow-800",
    border: "border-yellow-300",
    shadow: "hover:shadow-yellow-300/50",
  },
  // Green spectrum - DARKER & MORE VIBRANT
  {
    bg: "bg-gradient-to-br from-lime-200 to-lime-100",
    hover: "hover:from-lime-300 hover:to-lime-200",
    text: "text-lime-800",
    border: "border-lime-300",
    shadow: "hover:shadow-lime-300/50",
  },
  {
    bg: "bg-gradient-to-br from-green-200 to-green-100",
    hover: "hover:from-green-300 hover:to-green-200",
    text: "text-green-800",
    border: "border-green-300",
    shadow: "hover:shadow-green-300/50",
  },
  {
    bg: "bg-gradient-to-br from-emerald-200 to-emerald-100",
    hover: "hover:from-emerald-300 hover:to-emerald-200",
    text: "text-emerald-800",
    border: "border-emerald-300",
    shadow: "hover:shadow-emerald-300/50",
  },
  {
    bg: "bg-gradient-to-br from-teal-200 to-teal-100",
    hover: "hover:from-teal-300 hover:to-teal-200",
    text: "text-teal-800",
    border: "border-teal-300",
    shadow: "hover:shadow-teal-300/50",
  },
  // Blue spectrum - DARKER & MORE VIBRANT
  {
    bg: "bg-gradient-to-br from-cyan-200 to-cyan-100",
    hover: "hover:from-cyan-300 hover:to-cyan-200",
    text: "text-cyan-800",
    border: "border-cyan-300",
    shadow: "hover:shadow-cyan-300/50",
  },
  {
    bg: "bg-gradient-to-br from-sky-200 to-sky-100",
    hover: "hover:from-sky-300 hover:to-sky-200",
    text: "text-sky-800",
    border: "border-sky-300",
    shadow: "hover:shadow-sky-300/50",
  },
  {
    bg: "bg-gradient-to-br from-blue-200 to-blue-100",
    hover: "hover:from-blue-300 hover:to-blue-200",
    text: "text-blue-800",
    border: "border-blue-300",
    shadow: "hover:shadow-blue-300/50",
  },
  {
    bg: "bg-gradient-to-br from-indigo-200 to-indigo-100",
    hover: "hover:from-indigo-300 hover:to-indigo-200",
    text: "text-indigo-800",
    border: "border-indigo-300",
    shadow: "hover:shadow-indigo-300/50",
  },
  // Purple spectrum - DARKER & MORE VIBRANT
  {
    bg: "bg-gradient-to-br from-violet-200 to-violet-100",
    hover: "hover:from-violet-300 hover:to-violet-200",
    text: "text-violet-800",
    border: "border-violet-300",
    shadow: "hover:shadow-violet-300/50",
  },
  {
    bg: "bg-gradient-to-br from-purple-200 to-purple-100",
    hover: "hover:from-purple-300 hover:to-purple-200",
    text: "text-purple-800",
    border: "border-purple-300",
    shadow: "hover:shadow-purple-300/50",
  },
  {
    bg: "bg-gradient-to-br from-fuchsia-200 to-fuchsia-100",
    hover: "hover:from-fuchsia-300 hover:to-fuchsia-200",
    text: "text-fuchsia-800",
    border: "border-fuchsia-300",
    shadow: "hover:shadow-fuchsia-300/50",
  },
  {
    bg: "bg-gradient-to-br from-pink-200 to-pink-100",
    hover: "hover:from-pink-300 hover:to-pink-200",
    text: "text-pink-800",
    border: "border-pink-300",
    shadow: "hover:shadow-pink-300/50",
  },
  // Additional VIBRANT gradient combinations
  {
    bg: "bg-gradient-to-br from-rose-200 to-orange-200",
    hover: "hover:from-rose-300 hover:to-orange-300",
    text: "text-rose-800",
    border: "border-rose-300",
    shadow: "hover:shadow-rose-300/50",
  },
  {
    bg: "bg-gradient-to-br from-emerald-200 to-teal-200",
    hover: "hover:from-emerald-300 hover:to-teal-300",
    text: "text-emerald-800",
    border: "border-emerald-300",
    shadow: "hover:shadow-emerald-300/50",
  },
  {
    bg: "bg-gradient-to-br from-violet-200 to-indigo-200",
    hover: "hover:from-violet-300 hover:to-indigo-300",
    text: "text-violet-800",
    border: "border-violet-300",
    shadow: "hover:shadow-violet-300/50",
  },
];

// Hash function to consistently assign colors to tags
function hashTagToColor(tagName: string): number {
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = (hash << 5) - hash + tagName.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % TAG_COLORS.length;
}

export default function Tag({
  tags,
}: {
  tags: {
    edges: TagInterface[];
  };
}) {
  const renderTagButton = (name: string, prevIconName?: string) => {
    const IconComp = getIconComponentForTag(name, prevIconName) as any;
    const colorIndex = hashTagToColor(name);
    const colorScheme = TAG_COLORS[colorIndex];
    
    return { IconComp, colorScheme };
  };

  return (
    <div className="max-w-2xl w-full mx-auto px-4 md:px-0">
      {/* Left-aligned heading */}
      <h3 className="mt-12 mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100 text-left">
        tags
      </h3>
      
      {/* Left-aligned flex container */}
      <div className="flex flex-wrap gap-3 justify-start">
        {tags.edges.map((tag, index) => {
          const name = tag.node.name;
          const prev = index > 0 ? tags.edges[index - 1].node.name : undefined;
          const { IconComp, colorScheme } = renderTagButton(name, prev as string | undefined);
          
          return (
            <Link key={index} href={`/tag/${name}`}>
              <button
                className={`
                  group inline-flex items-center gap-2.5
                  ${colorScheme.bg} ${colorScheme.hover} ${colorScheme.text}
                  border ${colorScheme.border}
                  font-semibold text-sm
                  py-2.5 px-5
                  rounded-full
                  transition-all duration-300 ease-out
                  hover:scale-105 hover:-translate-y-0.5
                  hover:shadow-lg ${colorScheme.shadow}
                  active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300
                `}
                aria-label={`View posts tagged with ${name}`}
              >
                <IconComp 
                  className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" 
                />
                <span className="relative">
                  {name}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-40"></span>
                </span>
              </button>
            </Link>
          );
        })}
      </div>

      {/* Decorative gradient line */}
      <div className="mt-8 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
    </div>
  );
}
