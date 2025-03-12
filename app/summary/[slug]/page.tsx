"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WorkoutChart } from "../../components/workout-chart";
import { format } from "date-fns";
import { Edit2 } from "lucide-react";
import NumberWheel from "../../components/number-wheel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";

const workoutNames = {
  "max-day": "Max Day",
  "sub-max-volume": "Sub Max Volume",
  "ladder-volume": "Ladder Volume",
};

export default function SummaryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const [reps, setReps] = useState<(number | "X")[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [wheelValue, setWheelValue] = useState<number>(0);

  useEffect(() => {
    const savedWorkout = localStorage.getItem(`workout_${slug}`);
    if (savedWorkout) {
      const { reps } = JSON.parse(savedWorkout);
      setReps(reps);
    }
  }, [slug]);

  // Find the nearest valid rep count for initializing the number wheel
  const findNearestRepCount = (index: number): number => {
    // First check previous sets
    for (let i = index - 1; i >= 0; i--) {
      if (typeof reps[i] === "number") {
        return reps[i] as number;
      }
    }
    // Then check following sets
    for (let i = index + 1; i < reps.length; i++) {
      if (typeof reps[i] === "number") {
        return reps[i] as number;
      }
    }
    // Default to 5 if no valid numbers found
    return 5;
  };

  return (
    <div className="w-full h-screen bg-background text-foreground p-2 sm:p-4 flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="flex-none">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-wider mb-2 text-primary">
          {workoutNames[slug as keyof typeof workoutNames]}
        </h1>
      </div>

      {/* Main Content Section */}
      <div className="flex-1 min-h-0 flex flex-col landscape:flex-row gap-2 sm:gap-4">
        {/* Left Column - Sets and Reps List */}
        <div className="flex-1 overflow-auto rounded-lg bg-card/30 p-3">
          <h2 className="text-lg font-light mb-2">Workout Results</h2>
          <div className="space-y-1">
            {reps.map((rep, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm sm:text-base text-muted-foreground font-light">
                    Set {index + 1}:
                  </span>
                  <span className="text-sm sm:text-base text-primary font-light">
                    <div className="flex items-center gap-2">
                      <span>{rep === "X" ? "X" : `${rep} reps`}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary/80"
                        onClick={() => {
                          if (editingIndex === index) {
                            setEditingIndex(null);
                          } else {
                            const initialValue =
                              rep === "X" ? findNearestRepCount(index) : rep;
                            setWheelValue(initialValue);
                            setEditingIndex(index);
                          }
                        }}
                        title="Edit Reps"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column - Number Wheel when editing */}
        {editingIndex !== null && (
          <div className="flex-none flex flex-col items-center justify-center gap-4 p-3">
            <NumberWheel
              min={1}
              max={50}
              value={wheelValue}
              onChange={(value) => value !== null && setWheelValue(value)}
              completedReps={reps}
            />
            <Button
              onClick={() => {
                const newReps = [...reps];
                newReps[editingIndex] = wheelValue;
                setReps(newReps);
                setEditingIndex(null);
                // Save to localStorage
                localStorage.setItem(
                  `workout_${slug}`,
                  JSON.stringify({ reps: newReps })
                );
              }}
              variant="ghost"
              className="text-primary hover:text-primary/80"
            >
              Save
            </Button>
          </div>
        )}

        {/* Right Column - Chart Section */}
        <div className="flex-1 h-[200px] landscape:h-auto rounded-lg bg-card/30 p-3">
          <WorkoutChart data={reps.map((rep) => (rep === "X" ? 0 : rep))} />
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex-none mt-2 sm:mt-4 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg text-primary font-light">Total Reps:</span>
          <span className="text-lg text-primary font-light">
            {reps.reduce<number>((total, rep) => {
              if (typeof rep === "number") {
                return total + rep;
              }
              return total;
            }, 0)}
          </span>
        </div>
        <Link
          href="/"
          className="bg-primary/30 text-primary hover:bg-primary/40 transition-colors rounded-full py-2 px-4 text-sm font-medium"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

// Helper function to determine workout type based on rep count
function getWorkoutType(repCount: number): string {
  if (repCount === 3) return "max-day";
  if (repCount === 10) return "sub-max-volume";
  if (repCount === 5) return "ladder-volume";
  return "unknown";
}
