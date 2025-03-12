"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { WorkoutChart } from "../../components/workout-chart"
import { format } from "date-fns"
import { Edit2 } from "lucide-react"
import NumberWheel from "../../components/number-wheel"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"
import { useParams, useSearchParams } from "next/navigation"

const workoutNames = {
  "max-day": "Max Day",
  "sub-max-volume": "Sub Max Volume",
  "ladder-volume": "Ladder Volume",
}

export default function SummaryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params?.slug as string
  const [reps, setReps] = useState<(number | "X")[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [wheelValue, setWheelValue] = useState<number>(0)

  useEffect(() => {
    const savedWorkout = localStorage.getItem(`workout_${slug}`)
    if (savedWorkout) {
      const { reps } = JSON.parse(savedWorkout)
      setReps(reps)
    }
  }, [slug])

  return (
    <div className="w-full h-full bg-background text-foreground p-4 flex flex-col justify-between overflow-hidden">
      <div className="w-full flex-grow flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-light tracking-wider mb-4 text-primary">
          {workoutNames[slug as keyof typeof workoutNames]}
        </h1>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto">
          {/* Sets and Reps List */}
          <div className="space-y-2 overflow-auto">
            <h2 className="text-xl font-light mb-2">Current Workout</h2>
            {reps.map((rep, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-base sm:text-lg text-muted-foreground font-light">Set {index + 1}:</span>
                <span className="text-base sm:text-lg text-primary font-light">
                  {rep === "X" ? "X" : `${rep} reps`}
                </span>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="h-64 md:h-full w-full">
            <WorkoutChart data={reps.map((rep) => (rep === "X" ? 0 : rep))} />
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <Link
            href="/"
            className="bg-primary/30 text-primary hover:bg-primary/40 transition-colors rounded-full py-2 px-6 text-sm sm:text-base font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

// Helper function to determine workout type based on rep count
function getWorkoutType(repCount: number): string {
  if (repCount === 3) return "max-day"
  if (repCount === 10) return "sub-max-volume"
  if (repCount === 5) return "ladder-volume"
  return "unknown"
}

