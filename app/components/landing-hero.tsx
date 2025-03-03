"use client"

import { Button } from "@/components/ui/button"
import { WorkoutProgressChart } from "./workout-progress-chart"
import Link from "next/link"
import placeholderData from "@/placeholderData.json"
import { useState, useEffect } from "react"

export function LandingHero() {
  const [scrollOpacity, setScrollOpacity] = useState(1)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const fadeStart = 100 // Start fading when scroll position is 100px
      const fadeEnd = 300 // Fully faded when scroll position is 300px
      const opacity = Math.max(0, 1 - (scrollPosition - fadeStart) / (fadeEnd - fadeStart))
      setScrollOpacity(opacity)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex flex-col items-center py-16">
      {/* Main Content */}
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center px-4">
        <div className="space-y-8">
          <h1 className="text-6xl font-extrabold leading-tight tracking-tight">
            <span className="font-light">Visualize</span>{" "}
            <span className="font-normal">Your</span>{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-transparent bg-clip-text">Workouts</span>{" "}
            <span className="text-muted-foreground font-thin">&</span>{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-transparent bg-clip-text">Progress</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light">
            Track, analyze, and improve your pull-up journey with beautiful visualizations and structured workouts.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" size="lg" asChild>
              <Link href="#how-it-works">How does it work?</Link>
            </Button>
            <Button size="lg" asChild>
              <Link href="#get-started">Start a workout</Link>
            </Button>
          </div>
        </div>

        {/* Example Chart */}
        <div className="relative">
          <WorkoutProgressChart demoData={placeholderData} />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="fixed bottom-8 flex items-center gap-2 text-muted-foreground animate-bounce pointer-events-none z-50"
        style={{ opacity: scrollOpacity }}
      >
        <span className="material-symbols-outlined">mouse</span>
        <span className="text-sm">Scroll to see more sections</span>
      </div>
    </div>
  )
} 