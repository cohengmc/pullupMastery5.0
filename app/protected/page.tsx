import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WorkoutHistory } from "../components/workout-history";
import { WorkoutHeatmap } from "../components/workout-heatmap";
import { WorkoutCalendar } from "../components/workout-calendar";
import { ThemeToggle } from "../components/theme-toggle";
import { WorkoutFormWrapper } from "../components/workout-form-wrapper";
import { WorkoutProgressChart } from "../components/workout-progress-chart";
import { WorkoutSelection } from "../components/workout-selection";

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
              <WorkoutFormWrapper />
              <ThemeToggle />
            </div>
          </div>

          {/* Row 1: Workout Selection and Calendar */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Column 1: Workout Selection */}
            <WorkoutSelection className="border border-border" />

            {/* Column 2: Calendar */}
            <WorkoutCalendar className="bg-primary/20 rounded-xl p-4 sm:p-6 transition-colors" />
          </div>

          {/* Row 2: Yearly Activity */}
          <WorkoutHeatmap className="bg-primary/20 rounded-xl p-4 sm:p-6 transition-colors" />

          {/* Row 3: Workout Progress */}
          <WorkoutProgressChart className="bg-primary/20 rounded-xl p-4 sm:p-6 transition-colors" />

          {/* Row 4: Workout History */}
          <WorkoutHistory className="bg-primary/20 rounded-xl p-4 sm:p-6 transition-colors" />
        </div>
      </div>
    </div>
  );
}
