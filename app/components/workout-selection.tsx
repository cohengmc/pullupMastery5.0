"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkouts } from "@/hooks/use-workouts"
import { toast } from "sonner"
import { useCallback } from "react"
import { AlertCircle } from "lucide-react"

const workouts = [
  {
    name: "Max Day",
    slug: "max-day",
    description: "3 sets with 5 minute rest",
  },
  {
    name: "Sub Max Volume",
    slug: "sub-max-volume",
    description: "10 sets with 1 minute rest",
  },
  {
    name: "Ladder Volume",
    slug: "ladder-volume",
    description: "5 sets with 30 second rest",
  },
]

interface WorkoutSelectionProps {
  className?: string
}

export function WorkoutSelection({ className }: WorkoutSelectionProps) {
  const { workouts: existingWorkouts } = useWorkouts()

  const handleWorkoutClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    // Check if there's a workout for today
    const today = new Date().toISOString().split('T')[0]
    const hasWorkoutToday = existingWorkouts.some(w => w.workout_date === today)

    if (hasWorkoutToday) {
      e.preventDefault()
      toast("Workout Already Completed", {
        description: "You've already completed a workout today. Come back tomorrow!",
        duration: 3000,
        className: "bg-primary/60 text-foreground border-primary",
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }, [existingWorkouts])

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle>
          Select Your Workout
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {workouts.map((workout) => (
            <Link
              key={workout.slug}
              href={`/workout/${workout.slug}`}
              className="block"
              onClick={(e) => handleWorkoutClick(e, workout.slug)}
              title={`Begin ${workout.name} Workout`}
            >
              <div className="bg-primary/20 hover:bg-primary/40 rounded-xl p-4 transition-colors">
                <h3 className="text-xl font-semibold mb-1">{workout.name}</h3>
                <p className="text-primary/80 text-sm">
                  {workout.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 