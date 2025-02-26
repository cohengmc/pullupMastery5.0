"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { RealtimeChannel } from "@supabase/supabase-js"

export interface Workout {
  workout_id: number
  workout_date: string
  reps: number[]
  created_at: string
  updated_at: string
  workout_extra_info: Array<{
    option_id: number
    extra_info_options: {
      option_name: string
    }
  }>
}

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [version, setVersion] = useState(0)
  const supabase = createClient()

  const fetchWorkouts = useCallback(async () => {
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
        .select(`
          *,
          workout_extra_info (
            option_id,
            extra_info_options (
              option_name
            )
          )
        `)
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
  }, [supabase])

  useEffect(() => {
    // Check authentication status immediately
    const checkAuth = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error("Authentication error:", authError)
        return
      }
      console.log("Authentication check - User:", user ? "Authenticated as " + user.id : "Not authenticated")
    }
    checkAuth()

    // Set up real-time subscriptions
    console.log("Setting up real-time subscription...")
    
    const channel = supabase
      .channel('public:workouts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts'
        },
        (payload) => {
          console.log("Received real-time change:", payload)
          console.log("Triggering workout refetch by incrementing version")
          setVersion(v => {
            console.log("Current version:", v, "New version:", v + 1)
            return v + 1
          })
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up subscription")
      channel.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    console.log("Fetching workouts due to version change:", version)
    fetchWorkouts()
  }, [fetchWorkouts, version])

  return { workouts, loading, error }
} 