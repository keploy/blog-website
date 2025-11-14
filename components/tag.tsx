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
  const renderTagButton = (name: string, prevIconName?: string) => {
    const IconComp = getIconComponentForTag(name, prevIconName) as any;
    // Fixed neutral gray styling for all tags
    const classes = `bg-slate-100 hover:bg-slate-200 text-slate-700`;
    return { IconComp, classes };
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
