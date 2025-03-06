"use client"

import { useState, useEffect, use, useCallback } from "react"
import Link from "next/link"
import { WorkoutChart } from "../../components/workout-chart"
import { format } from "date-fns"
import { Edit2 } from "lucide-react"
import NumberWheel from "../../components/number-wheel"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { useWorkouts } from "@/app/hooks/use-workouts"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"

const workoutNames = {
  "max-day": "Max Day",
  "sub-max-volume": "Sub Max Volume",
  "ladder-volume": "Ladder Volume",
}

type PageParams = {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function SummaryPage({ params, searchParams }: PageParams) {
  const { slug } = params
  const [reps, setReps] = useState<(number | "X")[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [wheelValue, setWheelValue] = useState<number>(0)
  const { workouts, loading, mutate } = useWorkouts()
  const supabase = createClient()
  const [isSaving, setIsSaving] = useState(false)

  // Save workout to Supabase
  const saveWorkoutToSupabase = useCallback(async (workoutReps: (number | "X")[]) => {
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("Please sign in to save your workout")
        return
      }

      // Convert X values to 0 for database storage
      const validReps = workoutReps.map(rep => rep === "X" ? 0 : rep)
      
      // Check if there's already a workout for today of the same type
      const today = new Date().toISOString().split('T')[0]
      const { data: existingWorkouts } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('workout_date', today)

      // Find workout of the same type (based on rep count)
      const existingWorkout = existingWorkouts?.find(w => getWorkoutType(w.reps.length) === slug)
      
      let workoutError
      
      if (existingWorkout) {
        // Update existing workout
        const { error } = await supabase
          .from('workouts')
          .update({
            reps: validReps,
            updated_at: new Date().toISOString()
          })
          .eq('workout_id', existingWorkout.workout_id)
          .eq('user_id', user.id)
        
        workoutError = error
      } else {
        // Insert new workout
        const { error } = await supabase
          .from('workouts')
          .insert({
            user_id: user.id,
            workout_date: today,
            reps: validReps
          })
          .select()
          .single()
        
        workoutError = error
      }

      if (workoutError) throw workoutError

      // Refresh the workouts data
      await mutate()
      
      // Only clear localStorage after successful save, but keep the reps in state
      localStorage.removeItem(`workout_${slug}`)
      
      // Only show success message if there are no X values
      if (!workoutReps.includes("X")) {
        toast.success("Workout saved successfully!", {
          duration: 2000
        })
      }
    } catch (error) {
      console.error('Error saving workout:', error)
      toast.error("Failed to save workout")
      throw error // Re-throw to be caught by the useEffect
    } finally {
      setIsSaving(false)
    }
  }, [supabase, slug, mutate])

  // Update workout in Supabase
  const updateWorkoutInSupabase = useCallback(async (workoutId: number, newReps: (number | "X")[]) => {
    try {
      setIsSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("Please sign in to update your workout")
        return
      }

      // Convert X values to 0 for database storage
      const validReps = newReps.map(rep => rep === "X" ? 0 : rep)
      
      // Update the workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({
          reps: validReps,
          updated_at: new Date().toISOString()
        })
        .eq('workout_id', workoutId)
        .eq('user_id', user.id)

      if (workoutError) throw workoutError

      // Refresh the workouts data
      await mutate()
      
      // Only show success message if there are no X values
      if (!newReps.includes("X")) {
        toast.success("Workout updated successfully!")
      }
    } catch (error) {
      console.error('Error updating workout:', error)
      toast.error("Failed to update workout")
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [supabase, mutate])

  useEffect(() => {
    const savedWorkout = localStorage.getItem(`workout_${slug}`)
    if (savedWorkout) {
      const { reps } = JSON.parse(savedWorkout)
      setReps(reps)
      
      // Add a flag to localStorage to prevent duplicate saves
      const isSaving = localStorage.getItem(`saving_${slug}`)
      if (!isSaving) {
        // Check for X sets and show warning before saving
        if (reps.includes("X")) {
          toast("Incomplete Workout", {
            description: "You have sets that need rep counts. Please complete all sets before saving.",
            duration: 5000,
            className: "bg-destructive/10 text-destructive border-destructive",
            icon: <AlertCircle className="h-5 w-5 text-destructive" />,
          })
        }
        
        localStorage.setItem(`saving_${slug}`, 'true')
        // If there's workout data in localStorage, save it to Supabase
        saveWorkoutToSupabase(reps)
          .catch(error => {
            console.error('Error in useEffect saving workout:', error)
            toast.error("Failed to save workout")
          })
          .finally(() => {
            localStorage.removeItem(`saving_${slug}`)
          })
      }
    }
  }, [slug, saveWorkoutToSupabase])

  // Get the last workout of the specified type, excluding today's workout
  const today = new Date().toISOString().split('T')[0]
  const lastWorkout = workouts
    .filter(workout => 
      getWorkoutType(workout.reps.length) === slug && 
      workout.workout_date < today
    )
    .sort((a, b) => new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime())[0]

  // Calculate total reps based on workout type
  const totalReps =
    slug === "ladder-volume"
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
    <div className="w-full h-full bg-background text-foreground p-4 flex flex-col justify-between overflow-hidden">
      <div className="w-full flex-grow flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-light tracking-wider mb-4 text-primary">
          {workoutNames[slug as keyof typeof workoutNames]}
        </h1>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto">
          {/* Sets and Reps List */}
          <div className="space-y-2 overflow-auto">
            <h2 className="text-xl font-light mb-2">Current Workout</h2>
            {reps.map((rep, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-base sm:text-lg text-muted-foreground font-light">Set {index + 1}:</span>
                <span className="text-base sm:text-lg text-primary font-light">
                  {editingIndex === index ? (
                    <div className="flex items-center gap-4">
                      <NumberWheel
                        min={0}
                        max={50}
                        value={wheelValue}
                        onChange={(value) => value !== null && setWheelValue(value)}
                        isFirstSet={false}
                      />
                      <Button
                        onClick={async () => {
                          try {
                            const newReps = [...reps]
                            newReps[editingIndex] = wheelValue
                            setReps(newReps)
                            
                            // Find today's workout of the same type
                            const today = new Date().toISOString().split('T')[0]
                            const existingWorkout = workouts.find(w => 
                              getWorkoutType(w.reps.length) === slug &&
                              w.workout_date === today
                            )
                            
                            if (existingWorkout) {
                              // Update the workout in Supabase
                              await updateWorkoutInSupabase(existingWorkout.workout_id, newReps)
                            } else {
                              // If somehow we don't find the workout (edge case), save to localStorage
                              localStorage.setItem(`workout_${slug}`, JSON.stringify({ reps: newReps }))
                            }
                          } catch (error) {
                            console.error('Error in edit workflow:', error)
                          } finally {
                            setEditingIndex(null)
                          }
                        }}
                        variant="ghost"
                        className="ml-2 text-primary hover:text-primary/80"
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{rep === "X" ? "X" : `${rep} reps`}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary/80"
                        onClick={() => {
                          const initialValue = rep === "X" ? 5 : rep
                          setWheelValue(initialValue)
                          setEditingIndex(index)
                        }}
                        title="Edit Reps"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </span>
              </div>
            ))}

            {lastWorkout && (
              <div className="mt-8">
                <h2 className="text-xl font-light mb-2">Last {workoutNames[slug as keyof typeof workoutNames]}</h2>
                <div className="flex items-center space-x-3">
                  <span className="text-base sm:text-lg text-muted-foreground font-light">Date:</span>
                  <span className="text-base sm:text-lg text-primary font-light">
                    {format(new Date(lastWorkout.workout_date), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-base sm:text-lg text-muted-foreground font-light">Reps:</span>
                  <span className="text-base sm:text-lg text-primary font-light">
                    {lastWorkout.reps.join(",")}
                  </span>
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
  )
}

// Helper function to determine workout type based on rep count
function getWorkoutType(repCount: number): string {
  if (repCount === 3) return "max-day"
  if (repCount === 10) return "sub-max-volume"
  if (repCount === 5) return "ladder-volume"
  return "unknown"
}

