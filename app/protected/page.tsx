import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WorkoutHistory } from "../components/workout-history";
import { WorkoutHeatmap } from "../components/workout-heatmap";
import { WorkoutCalendar } from "../components/workout-calendar";
import { ThemeToggle } from "../components/theme-toggle";
import { AddWorkoutForm } from "../components/add-workout-form";
import { WorkoutProgressChart } from "../components/workout-progress-chart";

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

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div>
      <div className="min-h-screen bg-background text-foreground p-6 sm:p-8 md:p-12 lg:p-16 transition-colors">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl sm:text-4xl font-light tracking-wider">
              Pull Up Mastery
            </h1>
            <div className="flex items-center space-x-2">
              <AddWorkoutForm />
              <ThemeToggle />
            </div>
          </div>

          {/* Row 1: Workout Selection and Calendar */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Column 1: Workout Selection */}
            <div className="bg-gray-900/30 dark:bg-gray-900/30 rounded-xl p-4 sm:p-6 transition-colors">
              <h2 className="text-xl sm:text-2xl font-light text-gray-400 mb-4">
                Select Your Workout
              </h2>
              <div className="grid gap-3">
                {workouts.map((workout) => (
                  <Link
                    key={workout.slug}
                    href={`/workout/${workout.slug}`}
                    className="block"
                  >
                    <div className="bg-muted/50 hover:bg-muted dark:bg-gray-900/50 dark:hover:bg-gray-900 rounded-xl p-4 transition-colors">
                      <h3 className="text-xl font-light mb-1">
                        {workout.name}
                      </h3>
                      <p className="text-cyan-400/80 text-sm">
                        {workout.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Column 2: Calendar */}
            <WorkoutCalendar className="bg-gray-900/30 dark:bg-gray-900/30 rounded-xl p-4 sm:p-6 transition-colors" />
          </div>

          {/* Row 2: Yearly Activity */}
          <WorkoutHeatmap className="bg-gray-900/30 dark:bg-gray-900/30 rounded-xl p-4 sm:p-6 transition-colors" />

          {/* Row 3: Workout Progress */}
          <WorkoutProgressChart className="bg-gray-900/30 dark:bg-gray-900/30 rounded-xl p-4 sm:p-6 transition-colors" />

          {/* Row 4: Workout History */}
          <WorkoutHistory className="bg-gray-900/30 dark:bg-gray-900/30 rounded-xl p-4 sm:p-6 transition-colors" />
        </div>
      </div>
      <div className="flex-1 w-full flex flex-col gap-12">
        <div className="w-full">
          <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
            <InfoIcon size="16" strokeWidth={2} />
            This is a protected page that you can only see as an authenticated
            user
          </div>
        </div>
        <div className="flex flex-col gap-2 items-start">
          <h2 className="font-bold text-2xl mb-4">Your user details</h2>
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        <div>
          <h2 className="font-bold text-2xl mb-4">Next steps</h2>
          <FetchDataSteps />
        </div>
      </div>
    </div>
  );
}
