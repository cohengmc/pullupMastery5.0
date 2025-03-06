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

  const mutate = useCallback(() => {
    setVersion(v => v + 1)
  }, [])

  const fetchWorkouts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // If no user is authenticated, return empty array without error
      if (!user) {
        setWorkouts([])
        setLoading(false)
        return
      }

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
        console.error("Error fetching workouts:", error)
        throw error
      }

      if (!data || data.length === 0) {
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
          
          if (repsArray.some(isNaN)) {
            console.error(`Invalid reps data for workout ${workout.workout_id}`)
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
    }
    checkAuth()

    // Set up real-time subscriptions only if user is authenticated
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return // Skip subscription if no user
      
      const channel = supabase
        .channel('public:workouts')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'workouts'
          },
          () => {
            setVersion(v => v + 1)
          }
        )
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    }

    const cleanup = setupRealtimeSubscription()
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.())
    }
  }, [supabase])

  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts, version])

  return { workouts, loading, error, mutate }
} 