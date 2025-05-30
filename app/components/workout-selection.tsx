"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
];

interface WorkoutSelectionProps {
  className?: string;
}

export function WorkoutSelection({ className }: WorkoutSelectionProps) {
  return (
    <Card className={cn("w-full border-none landscape:text-center", className)}>
      <CardHeader className="pb-2">
        <CardTitle>Select Your Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col landscape:flex-row gap-3">
          {workouts.map((workout) => (
            <Link
              key={workout.slug}
              href={`/workout/${workout.slug}`}
              className="block"
              title={`Begin ${workout.name} Workout`}
            >
              <div className="bg-primary/20 hover:bg-primary/40 rounded-xl p-4 transition-colors">
                <h3 className="text-xl font-semibold mb-1">{workout.name}</h3>
                <p className="text-primary/80 text-sm">{workout.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
