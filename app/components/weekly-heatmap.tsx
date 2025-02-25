"use client"

import { useMemo } from "react"
import { eachWeekOfInterval, endOfWeek, isSameWeek, subWeeks, parseISO } from "date-fns"
import { useWorkouts } from "@/hooks/use-workouts"
import { Skeleton } from "@/components/ui/skeleton"

const weeks = 52

const colorMap = {
  none: {
    color: "rgb(31, 41, 55)",
    label: "No workouts",
  },
  low: {
    color: "#1c4115",
    label: "1 workout",
  },
  medium: {
    color: "#25821b",
    label: "2 workouts",
  },
  high: {
    color: "#21ca18",
    label: "+3 workouts",
  },
}

export function WeeklyHeatmap() {
  const { workouts, loading, error } = useWorkouts()

  // Process workout data into heatmap format
  const weeklyData = useMemo(() => {
    if (!workouts.length) return []

    const today = new Date()
    const startDate = subWeeks(today, weeks - 1)

    // Create array of all weeks in range
    const weeksInRange = eachWeekOfInterval({ start: startDate, end: today })

    // Parse workout dates
    const workoutDates = workouts.map(workout => parseISO(workout.workout_date))

    // Count workouts per week
    return weeksInRange.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart)
      return workoutDates.filter((date) => isSameWeek(date, weekStart)).length
    })
  }, [workouts])

  if (loading) {
    return <Skeleton className="w-full h-[140px]" />
  }

  if (error || !weeklyData.length) {
    return <div className="text-muted-foreground text-center py-4">No workout data available</div>
  }

  const getBackgroundColor = (count: number) => {
    if (count === 0) return colorMap.none.color
    if (count === 1) return colorMap.low.color
    if (count === 2) return colorMap.medium.color
    return colorMap.high.color
  }

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-52 gap-1 h-32">
        {weeklyData.map((count, index) => (
          <div
            key={index}
            className="rounded-sm transition-colors duration-300"
            style={{ backgroundColor: getBackgroundColor(count) }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6">
        {Object.values(colorMap).map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

