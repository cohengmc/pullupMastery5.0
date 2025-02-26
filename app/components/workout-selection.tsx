import Link from "next/link"
import { cn } from "@/lib/utils"

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
  return (
    <div className={cn("bg-primary/20 rounded-xl p-4 sm:p-6 transition-colors", className)}>
      <h2 className="text-xl sm:text-2xl font-light text-muted-foreground mb-4">
        Select Your Workout
      </h2>
      <div className="grid gap-3">
        {workouts.map((workout) => (
          <Link
            key={workout.slug}
            href={`/workout/${workout.slug}`}
            className="block"
          >
            <div className="bg-muted/50 hover:bg-muted rounded-xl p-4 transition-colors">
              <h3 className="text-xl font-light mb-1">{workout.name}</h3>
              <p className="text-primary/80 text-sm">
                {workout.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 