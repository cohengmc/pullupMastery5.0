"use client"

import { Button } from "@/components/ui/button"
import { WorkoutProgressChart } from "./workout-progress-chart"
import Link from "next/link"

const placeholderData = [
  { "date": "February 24, 2025", "reps": "7,5,4" },
  { "date": "February 26, 2025", "reps": "3,3,3,3,3,3,2,2,2,1" },
  { "date": "February 28, 2025", "reps": "3,3,2,2,2" },
  // Add more data as needed from placeholderData.json
]

export function LandingHero() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-8 px-4">
      {/* Main Content */}
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-6xl font-bold leading-tight">
            Visualize Your{" "}
            <span className="text-primary">Workouts</span>{" "}
            <span className="text-muted-foreground">&</span>{" "}
            <span className="text-secondary">Progress</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Track, analyze, and improve your pull-up journey with beautiful visualizations and structured workouts.
          </p>
          <div className="flex gap-4">
            <Button variant="outline" size="lg" asChild>
              <Link href="#how-it-works">How does it work?</Link>
            </Button>
            <Button size="lg" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Example Chart */}
        <div className="relative">
          <WorkoutProgressChart className="pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-muted-foreground animate-bounce">
        <span className="material-symbols-outlined">mouse</span>
        <span className="text-sm">Scroll to see more sections</span>
      </div>
    </div>
  )
} 