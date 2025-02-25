"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

export interface Workout {
  workout_id: number
  workout_date: string
  reps: number[]
  created_at: string
  updated_at: string
}

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        console.log("Fetching workouts...")
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error("No user found")
          throw new Error("User not authenticated")
        }
        console.log("User ID:", user.id)

        const { data, error } = await supabase
          .from("workouts")
          .select("*")
          .eq("user_id", user.id)
          .order("workout_date", { ascending: true })

        if (error) {
          console.error("Supabase error:", error)
          throw error
        }

        console.log("Raw workout data:", data)

        if (!data || data.length === 0) {
          console.log("No workout data found")
          setWorkouts([])
          return
        }

        // Convert reps string to array of numbers
        const processedData = data.map(workout => {
          try {
            // Handle both string and array cases for reps
            const repsArray = Array.isArray(workout.reps) 
              ? workout.reps 
              : typeof workout.reps === 'string'
                ? workout.reps.split(",").map((r: string) => parseInt(r.trim(), 10))
                : []

            console.log(`Workout ${workout.workout_id} reps:`, repsArray)
            
            if (repsArray.some(isNaN)) {
              console.error(`Invalid reps data for workout ${workout.workout_id}:`, workout.reps)
              return null
            }

            return {
              ...workout,
              reps: repsArray
            }
          } catch (err) {
            console.error(`Error processing workout ${workout.workout_id}:`, err)
            return null
          }
        }).filter((workout): workout is Workout => workout !== null)

        console.log("Processed workout data:", processedData)
        setWorkouts(processedData)
      } catch (err) {
        console.error("Error in fetchWorkouts:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch workouts"))
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [])

  return { workouts, loading, error }
} 