"use client"

import { usePathname } from "next/navigation"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { NavLogo } from "@/components/nav-logo"

export function NavBar() {
  const pathname = usePathname()
  
  // Hide nav bar for all workout pages
  if (pathname?.startsWith("/workout")) {
    return null
  }

  return (
    <nav className="w-full md:flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5">
        <NavLogo />
        <ThemeSwitcher />
      </div>
    </nav>
  )
} 