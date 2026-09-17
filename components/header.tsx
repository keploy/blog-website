"use client"
import Link from 'next/link'
import { useState } from 'react'

export interface HeaderProps {
  className?: string
}

export default function Header({ className = '' }: HeaderProps) {
  const [toggleMenu, setToggleMenu] = useState(false)

  const handleToggle = () => {
    setToggleMenu((prev) => !prev)
  }

  const closeMenu = () => {
    setToggleMenu(false)
  }

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`header-container mb-20 mt-8 flex justify-between items-center ${className}`.trim()}
    >
      <Link href="https://keploy.io/" className="logo w-40 relative z-20" aria-label="Keploy Home">
        <img src="/images/sidebyside-transparent.svg" alt="Keploy Logo" />
      </Link>
      <div className="menu md:block hidden">
        <ul className="flex gap-6 body text-lg">
          <li className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
            <Link href="https://keploy.io/">Home</Link>
          </li>
          <li className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
            <Link href="https://keploy.io/docs/">Docs</Link>
          </li>
          <li className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
            <Link href="/technology">Blog</Link>
          </li>
          <li className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]">
            <Link href="/">Community</Link>
          </li>
        </ul>
      </div>

      <button
        type="button"
        className="menu-icon md:hidden block focus:outline-none"
        aria-label="Toggle navigation menu"
        aria-expanded={toggleMenu}
        onClick={handleToggle}
      >
        <img src="/images/Menu.svg" alt="Toggle Menu" className="w-10" />
      </button>

      <div
        className={`menu-underlay w-screen h-screen fixed top-0 left-0 bg-black opacity-20 z-10 ${
          !toggleMenu ? 'hidden' : 'block'
        }`}
        onClick={closeMenu}
      />
      <div
        className={`mobile-menu flex pl-8 items-center fixed z-20 bg-white w-4/5 h-screen top-0 left-0 transition-transform duration-300 ${
          !toggleMenu ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <ul className="body text-3xl font-bold flex flex-col gap-8">
          <li onClick={closeMenu}>
            <Link href="https://keploy.io/">Home</Link>
          </li>
          <li onClick={closeMenu}>
            <Link href="https://keploy.io/docs/">Docs</Link>
          </li>
          <li onClick={closeMenu}>
            <Link href="/technology">Blog</Link>
          </li>
          <li onClick={closeMenu}>
            <Link href="/">Community</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
