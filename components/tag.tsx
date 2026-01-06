import Link from "next/link";
import { Tag as TagInterface } from "../types/tag";
import { getIconComponentForTag } from "../utils/tagIcons";

// Expanded to 20 distinct colors - NO white/gray colors
const TAG_COLORS = [
  // Warm colors
  {
    bg: "bg-gradient-to-br from-rose-100 to-rose-50",
    hover: "hover:from-rose-200 hover:to-rose-100",
    text: "text-rose-700",
    border: "border-rose-200",
    shadow: "hover:shadow-rose-200/50",
  },
  {
    bg: "bg-gradient-to-br from-red-100 to-red-50",
    hover: "hover:from-red-200 hover:to-red-100",
    text: "text-red-700",
    border: "border-red-200",
    shadow: "hover:shadow-red-200/50",
  },
  {
    bg: "bg-gradient-to-br from-orange-100 to-orange-50",
    hover: "hover:from-orange-200 hover:to-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    shadow: "hover:shadow-orange-200/50",
  },
  {
    bg: "bg-gradient-to-br from-amber-100 to-amber-50",
    hover: "hover:from-amber-200 hover:to-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    shadow: "hover:shadow-amber-200/50",
  },
  {
    bg: "bg-gradient-to-br from-yellow-100 to-yellow-50",
    hover: "hover:from-yellow-200 hover:to-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-200",
    shadow: "hover:shadow-yellow-200/50",
  },
  // Green spectrum
  {
    bg: "bg-gradient-to-br from-lime-100 to-lime-50",
    hover: "hover:from-lime-200 hover:to-lime-100",
    text: "text-lime-700",
    border: "border-lime-200",
    shadow: "hover:shadow-lime-200/50",
  },
  {
    bg: "bg-gradient-to-br from-green-100 to-green-50",
    hover: "hover:from-green-200 hover:to-green-100",
    text: "text-green-700",
    border: "border-green-200",
    shadow: "hover:shadow-green-200/50",
  },
  {
    bg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
    hover: "hover:from-emerald-200 hover:to-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    shadow: "hover:shadow-emerald-200/50",
  },
  {
    bg: "bg-gradient-to-br from-teal-100 to-teal-50",
    hover: "hover:from-teal-200 hover:to-teal-100",
    text: "text-teal-700",
    border: "border-teal-200",
    shadow: "hover:shadow-teal-200/50",
  },
  // Blue spectrum
  {
    bg: "bg-gradient-to-br from-cyan-100 to-cyan-50",
    hover: "hover:from-cyan-200 hover:to-cyan-100",
    text: "text-cyan-700",
    border: "border-cyan-200",
    shadow: "hover:shadow-cyan-200/50",
  },
  {
    bg: "bg-gradient-to-br from-sky-100 to-sky-50",
    hover: "hover:from-sky-200 hover:to-sky-100",
    text: "text-sky-700",
    border: "border-sky-200",
    shadow: "hover:shadow-sky-200/50",
  },
  {
    bg: "bg-gradient-to-br from-blue-100 to-blue-50",
    hover: "hover:from-blue-200 hover:to-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    shadow: "hover:shadow-blue-200/50",
  },
  {
    bg: "bg-gradient-to-br from-indigo-100 to-indigo-50",
    hover: "hover:from-indigo-200 hover:to-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-200",
    shadow: "hover:shadow-indigo-200/50",
  },
  // Purple spectrum
  {
    bg: "bg-gradient-to-br from-violet-100 to-violet-50",
    hover: "hover:from-violet-200 hover:to-violet-100",
    text: "text-violet-700",
    border: "border-violet-200",
    shadow: "hover:shadow-violet-200/50",
  },
  {
    bg: "bg-gradient-to-br from-purple-100 to-purple-50",
    hover: "hover:from-purple-200 hover:to-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
    shadow: "hover:shadow-purple-200/50",
  },
  {
    bg: "bg-gradient-to-br from-fuchsia-100 to-fuchsia-50",
    hover: "hover:from-fuchsia-200 hover:to-fuchsia-100",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
    shadow: "hover:shadow-fuchsia-200/50",
  },
  {
    bg: "bg-gradient-to-br from-pink-100 to-pink-50",
    hover: "hover:from-pink-200 hover:to-pink-100",
    text: "text-pink-700",
    border: "border-pink-200",
    shadow: "hover:shadow-pink-200/50",
  },
  // Additional distinct colors
  {
    bg: "bg-gradient-to-br from-rose-50 to-orange-50",
    hover: "hover:from-rose-100 hover:to-orange-100",
    text: "text-rose-600",
    border: "border-rose-200",
    shadow: "hover:shadow-rose-200/50",
  },
  {
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    hover: "hover:from-emerald-100 hover:to-teal-100",
    text: "text-emerald-600",
    border: "border-emerald-200",
    shadow: "hover:shadow-emerald-200/50",
  },
  {
    bg: "bg-gradient-to-br from-violet-50 to-indigo-50",
    hover: "hover:from-violet-100 hover:to-indigo-100",
    text: "text-violet-600",
    border: "border-violet-200",
    shadow: "hover:shadow-violet-200/50",
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
    <div className="max-w-2xl">
      {/* Left-aligned heading */}
      <h3 className="mt-12 mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">
        tags
      </h3>
      
      {/* Left-aligned flex container (removed justify-center) */}
      <div className="flex flex-wrap gap-3">
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
