"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import Link from "next/link"

export function NavLogo() {
  const [isHovering, setIsHovering] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  // Only show interactive elements after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleHover = () => {
    setIsHovering(true)
    // Reset after one iteration (assuming gif is 2 seconds)
    setTimeout(() => setIsHovering(false), 2000)
  }

  // Default to light theme logo during SSR
  const logoSrc = !mounted ? '/Crop_Pullup_Icon.png' : (
    theme === 'dark' 
      ? (isHovering ? '/Invert_Crop_Pullup.gif' : '/Invert_Crop_Pullup_Icon.gif')
      : (isHovering ? '/Crop_Pullup.gif' : '/Crop_Pullup_Icon.png')
  )

  return (
    <Link 
      href="/"
      className="flex items-center gap-4 cursor-pointer" 
      onMouseEnter={handleHover}
    >
      <Image
        src={logoSrc}
        alt="Pull Up Mastery Logo"
        width={32}
        height={32}
        className="object-contain"
      />
      <span className="font-semibold">Pull Up Mastery</span>
    </Link>
  )
} 