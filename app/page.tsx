import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";

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

export default async function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-5xl mx-auto p-6 sm:p-8 md:p-12 lg:p-16">
        <div className="space-y-6">
          <h1 className="text-3xl sm:text-4xl font-light tracking-wider">
            Pull Up Mastery
          </h1>

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
                    <h3 className="text-xl font-light mb-1">{workout.name}</h3>
                    <p className="text-cyan-400/80 text-sm">
                      {workout.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
