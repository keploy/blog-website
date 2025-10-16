import Link from "next/link";
import { Tag as TagInterface } from "../types/tag";
import AdSlot from "./Adslot";
import { getIconComponentForTag } from "../utils/tagIcons";
 
 export default function Tag({
   tags,
 }: {
   tags: {
     edges: TagInterface[];
   };
 }) {
   const colorChoices = [
     { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:bg-blue-200' },
     { bg: 'bg-sky-100', text: 'text-sky-700', hover: 'hover:bg-sky-200' },
     { bg: 'bg-cyan-100', text: 'text-cyan-700', hover: 'hover:bg-cyan-200' },
     { bg: 'bg-teal-100', text: 'text-teal-700', hover: 'hover:bg-teal-200' },
     { bg: 'bg-emerald-100', text: 'text-emerald-700', hover: 'hover:bg-emerald-200' },
     { bg: 'bg-green-100', text: 'text-green-700', hover: 'hover:bg-green-200' },
     { bg: 'bg-lime-100', text: 'text-lime-700', hover: 'hover:bg-lime-200' },
     { bg: 'bg-yellow-100', text: 'text-yellow-700', hover: 'hover:bg-yellow-200' },
     { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:bg-amber-200' },
     { bg: 'bg-orange-100', text: 'text-orange-700', hover: 'hover:bg-orange-200' },
     { bg: 'bg-red-100', text: 'text-red-700', hover: 'hover:bg-red-200' },
     { bg: 'bg-rose-100', text: 'text-rose-700', hover: 'hover:bg-rose-200' },
     { bg: 'bg-pink-100', text: 'text-pink-700', hover: 'hover:bg-pink-200' },
     { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', hover: 'hover:bg-fuchsia-200' },
     { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-200' },
     { bg: 'bg-violet-100', text: 'text-violet-700', hover: 'hover:bg-violet-200' },
     { bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:bg-indigo-200' },
     { bg: 'bg-blue-50', text: 'text-blue-700', hover: 'hover:bg-blue-100' },
     { bg: 'bg-sky-50', text: 'text-sky-700', hover: 'hover:bg-sky-100' },
     { bg: 'bg-cyan-50', text: 'text-cyan-700', hover: 'hover:bg-cyan-100' },
     { bg: 'bg-teal-50', text: 'text-teal-700', hover: 'hover:bg-teal-100' },
     { bg: 'bg-emerald-50', text: 'text-emerald-700', hover: 'hover:bg-emerald-100' },
     { bg: 'bg-green-50', text: 'text-green-700', hover: 'hover:bg-green-100' },
     { bg: 'bg-lime-50', text: 'text-lime-700', hover: 'hover:bg-lime-100' },
     { bg: 'bg-yellow-50', text: 'text-yellow-700', hover: 'hover:bg-yellow-100' },
     { bg: 'bg-amber-50', text: 'text-amber-700', hover: 'hover:bg-amber-100' },
     { bg: 'bg-orange-50', text: 'text-orange-700', hover: 'hover:bg-orange-100' },
     { bg: 'bg-red-50', text: 'text-red-700', hover: 'hover:bg-red-100' },
     { bg: 'bg-rose-50', text: 'text-rose-700', hover: 'hover:bg-rose-100' },
     { bg: 'bg-pink-50', text: 'text-pink-700', hover: 'hover:bg-pink-100' },
     { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', hover: 'hover:bg-fuchsia-100' },
     { bg: 'bg-purple-50', text: 'text-purple-700', hover: 'hover:bg-purple-100' },
     { bg: 'bg-violet-50', text: 'text-violet-700', hover: 'hover:bg-violet-100' },
     { bg: 'bg-indigo-50', text: 'text-indigo-700', hover: 'hover:bg-indigo-100' },
     { bg: 'bg-slate-100', text: 'text-slate-700', hover: 'hover:bg-slate-200' },
     { bg: 'bg-neutral-100', text: 'text-neutral-700', hover: 'hover:bg-neutral-200' },
     { bg: 'bg-stone-100', text: 'text-stone-700', hover: 'hover:bg-stone-200' },
   ];
 
   const getColorForTag = (name: string) => {
     let hash = 0;
     for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i);
     const idx = Math.abs(hash) % colorChoices.length;
     return colorChoices[idx];
   };
 
   const renderTagButton = (name: string, prevIconName?: string) => {
     const IconComp = getIconComponentForTag(name, prevIconName) as any;
     const { bg, text, hover } = getColorForTag(name);
     return { IconComp, classes: `${bg} ${hover} ${text}` };
   };
 
   return (
     <div className="max-w-2xl mx-auto">
       <p className="mt-8 text-lg font-bold">Tagged</p>
       <div className="flex flex-wrap mt-2">
         {tags.edges.map((tag, index) => {
           const name = tag.node.name;
           const prev = index > 0 ? tags.edges[index - 1].node.name : undefined;
           const { IconComp, classes } = renderTagButton(name, prev as string | undefined);
           return (
             <Link key={index} href={`/tag/${name}`}>
               <button
                 className={`inline-flex items-center ${classes} font-medium py-2 mr-2 mb-2 px-4 rounded transition-colors`}
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
