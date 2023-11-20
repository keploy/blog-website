"use client"
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {

  const [ToggleMenu, setToggleMenu] = useState(false);

  function toggleMenu() {
    setToggleMenu(true);
  }

  return (
    // <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight mb-20 mt-8">
    //   <Link href="/" className="hover:underline">
    //     Blog
    //   </Link>
    //   .
    // </h2>
    <div className="header-container mb-12 mt-8 flex justify-between">
      <Link href={"https://keploy.io/"} className="logo w-40 relative z-20">
        <img src="/blog/images/sidebyside-transparent.svg" alt="" />
      </Link>
      <div className="menu md:block hidden">
        <ul className='flex gap-6 body text-lg'>
          <li className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
            <Link href={"https://keploy.io/"}>Home</Link>
          </li>
          
          <li className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
            <Link href={"https://keploy.io/docs/"}>Docs</Link>
          </li>
          <li className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
            <Link href={"/technology"}>Blog</Link>
          </li>
          <li className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
            <Link href={"/community"}>Community</Link>
          </li>
        </ul>
      </div>
      
      <div className="menu-icon md:hidden block"><img src="/blog/images/Menu.svg" alt="menu" className='w-10' onClick={toggleMenu} /></div>
      <div className={`${"menu-underlay w-screen h-screen absolute top-0 left-0 bg-black opacity-20"} ${!ToggleMenu ? "hidden" : "block"}`} onClick={()=>setToggleMenu(false)}></div>
      <div className={`${"mobile-menu flex pl-8 items-center absolute z-10 bg-white w-4/5 h-screen top-0 left-0 transition-all duration-300"} ${!ToggleMenu ? " -translate-x-full" : ""}`}>
      <ul className='body text-3xl font-bold flex flex-col gap-8 '>
          <li className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
            <Link href={"https://keploy.io/"}>Home</Link>
          </li>
          
          <li className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
            <Link href={"https://keploy.io/docs/"}>Docs</Link>
          </li>
          <li className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
            <Link href={"/technology"}>Blog</Link>
          </li>
          <li className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
            <Link href={"/community"}>Community</Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
