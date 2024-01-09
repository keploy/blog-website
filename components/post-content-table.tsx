import { useState, useEffect } from "react";
import { parse } from "node-html-parser";

export default function PostContentTitle({ content }) {
    // abstract the headings
    const regexPattern = /<(h[1-6])[^>]*\bclass="wp-block-heading"[^>]*>(.*?)<\/(h[1-6])>/g;
    const headContent = content.match(regexPattern) || [];  

    //   Heading Text only
    const textContents: string[] = headContent.map((htmlString) => {
        //  convert into HTML DOC (it needed only if not sure that what type will be of the heading like <h2><i>..</i></h2>)
        const doc = parse(htmlString);
        return doc?.innerText.trim() || "";
    });
   
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const scrollToHeading = (index: number) => {
        const headings = document.getElementsByClassName("wp-block-heading");
        if (headings) {
            headings[index].scrollIntoView({ behavior: "smooth" });
            setActiveIndex(index);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const titles = document.querySelectorAll(".wp-block-heading");
            let currentActiveIndex: number | null = null;

            titles.forEach((title, index) => {
                const titleRect = title.getBoundingClientRect();
                if (titleRect.top <= 100) {
                    currentActiveIndex = index;
                }
            });

            setActiveIndex(currentActiveIndex);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [activeIndex]);

    return (
        <div className="w-full md:w-1/3 lg:w-1/3 xl:w-1/4 2xl:w-1/5 relative ">
            <div className="2xl:max-w-4xl lg:max-w-3xl max-w-xl body my-[3.2rem] sticky top-0 left-0 lg:pl-0 md:pl-0 xl:pl-0 pl-5 ">
                <h1 className="text-[22px] font-bold font-serif">Contents</h1>
                <ul className="mt-4">
                    {textContents.map((title, index) => (
                        <li
                            className={`mb-3 cursor-pointer `}
                            key={index}
                            onClick={() => scrollToHeading(index)}
                        >
                            <h2
                                id={`post-title-${index}`}
                                className={`${index === activeIndex
                                        ? "underline text-[#6938ef]"
                                        : "font-normal"
                                    } text-[19px] line-height-[32.368px] font-serif hover:text-[#6938ef] hover:underline `}
                            >
                                {title}
                            </h2>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
