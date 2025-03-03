"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { WorkoutChart } from "../../components/workout-chart"
import workoutData from "../../data/workoutData.json"
import { parse, format } from "date-fns"
import { Edit2 } from "lucide-react"
import NumberWheel from "../../components/number-wheel"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Route } from 'next'

const workoutNames = {
  "max-day": "Max Day",
  "sub-max-volume": "Sub Max Volume",
  "ladder-volume": "Ladder Volume",
}

export default function SummaryPage({
  params,
}: {
  params: { slug: string }
} & { [key: string]: any }) {
  const [reps, setReps] = useState<(number | "X")[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [wheelValue, setWheelValue] = useState<number>(0)

  useEffect(() => {
    const savedWorkout = localStorage.getItem(`workout_${params.slug}`)
    if (savedWorkout) {
      const { reps } = JSON.parse(savedWorkout)
      setReps(reps)
    }
  }, [params.slug])

  // Get the last workout of the current type
  const lastWorkout = workoutData.find((workout) => {
    const workoutType = getWorkoutType(workout.reps)
    return workoutType === params.slug
  })

  // Find the nearest valid rep count for initializing the number wheel
  const findNearestRepCount = (index: number): number => {
    // First check previous sets
    for (let i = index - 1; i >= 0; i--) {
      if (typeof reps[i] === "number") {
        return reps[i] as number
      }
    }
    // Then check following sets
    for (let i = index + 1; i < reps.length; i++) {
      if (typeof reps[i] === "number") {
        return reps[i] as number
      }
    }
    // Default to 5 if no valid numbers found
    return 5
  }

  const handleEditClick = (index: number) => {
    const currentValue = reps[index]
    const initialValue = currentValue === "X" ? findNearestRepCount(index) : (currentValue as number)
    setWheelValue(initialValue)
    setEditingIndex(index)
  }

  const handleWheelChange = (value: number | null) => {
    if (value !== null) {
      setWheelValue(value)
    }
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const newReps = [...reps]
      newReps[editingIndex] = wheelValue
      setReps(newReps)
      // Update localStorage
      localStorage.setItem(`workout_${params.slug}`, JSON.stringify({ reps: newReps }))
      setEditingIndex(null)
    }
  }

  // Calculate total reps based on workout type
  const totalReps =
    params.slug === "ladder-volume"
      ? reps.reduce((sum: number, rep) => {
          if (rep === "X") return sum
          const ladderSum = Array.from({ length: rep as number }, (_, i) => (rep as number) - i).reduce(
            (a: number, b: number) => a + b,
            0,
          )
          return sum + ladderSum
        }, 0)
      : reps.reduce((sum: number, rep) => sum + (rep === "X" ? 0 : (rep as number)), 0)

  // Filter out X values for the chart
  const chartData = reps.map((rep) => (rep === "X" ? 0 : (rep as number)))

  return (
    <div
      className={cn(
        "w-full h-full bg-background text-foreground p-4 flex flex-col justify-between overflow-hidden",
      )}
    >
      <div className="w-full flex-grow flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-light tracking-wider mb-4 text-primary">
          {workoutNames[params.slug as keyof typeof workoutNames]}
        </h1>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto">
          {/* Sets and Reps List */}
          <div className="space-y-2 overflow-auto">
            <h2 className="text-xl font-light mb-2">Current Workout</h2>
            {reps.map((rep, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-base sm:text-lg text-muted-foreground font-light">Set {`${index + 1}`}:</span>
                <span className="text-base sm:text-lg text-primary font-light">
                  {editingIndex === index ? (
                    <div className="flex items-center gap-4">
                      <NumberWheel
                        min={0}
                        max={50}
                        value={wheelValue}
                        onChange={handleWheelChange}
                        isFirstSet={false}
                      />
                      <Button
                        onClick={handleSaveEdit}
                        variant="ghost"
                        className="ml-2 text-primary hover:text-primary/80"
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{rep === "X" ? "X" : `${rep} reps`}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary/80"
                        onClick={() => handleEditClick(index)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </span>
              </div>
            ))}
            {lastWorkout && (
              <div className="mt-4">
                <h2 className="text-xl font-light mb-2">
                  Last {workoutNames[params.slug as keyof typeof workoutNames]}
                </h2>
                <div className="flex items-center space-x-3">
                  <span className="text-base sm:text-lg text-muted-foreground font-light">Date:</span>
                  <span className="text-base sm:text-lg text-primary font-light">
                    {format(parse(lastWorkout.date, "MMMM d, yyyy", new Date()), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-base sm:text-lg text-muted-foreground font-light">Reps:</span>
                  <span className="text-base sm:text-lg text-primary font-light">{lastWorkout.reps}</span>
                </div>
              </div>
            )}
          </div>

          {/* Chart Section */}
          <div className="h-64 md:h-full w-full">
            <WorkoutChart data={chartData} />
          </div>
        </div>

        {/* Total Reps Section */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-xl sm:text-2xl text-primary font-light">Total Reps:</span>
            <span className="text-xl sm:text-2xl text-foreground font-light">{totalReps}</span>
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

function getWorkoutType(reps: string): string {
  const repCount = reps.split(",").length
  if (repCount === 3) return "max-day"
  if (repCount === 10) return "sub-max-volume"
  if (repCount === 5) return "ladder-volume"
  return "unknown"
}

