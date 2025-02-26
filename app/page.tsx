import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { WorkoutSelection } from "@/components/workout-selection";

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
    <div className="bg-background text-foreground p-2 sm:p-4 md:p-8 lg:p-12 transition-colors">
      <div className="max-w-5xl mx-auto space-y-12">
        <h1 className="text-4xl sm:text-5xl font-light tracking-wider">
          Pull Up Mastery
        </h1>

        {/* Workout Selection */}
        <WorkoutSelection className="bg-card/30" />
      </div>
    </div>
  );
}
