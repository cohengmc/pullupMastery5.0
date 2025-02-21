"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { createClient } from '@/utils/supabase/client'
import { DayPickerSingleDateController } from 'react-dates'
import 'react-dates/initialize'
import 'react-dates/lib/css/_datepicker.css'
import 'app/styles/react-dates-overrides.css'
import moment from 'moment'
import { WorkoutPopup } from "./workout-popup"

interface Workout {
  workout_id: number
  user_id: string
  workout_date: string
  reps: number
  created_at: string
  updated_at: string
}

export function WorkoutCalendar({ className }: { className?: string }) {
  const [currentDate, setCurrentDate] = useState(moment())
  const [workoutDates, setWorkoutDates] = useState<Workout[]>([])
  const [hoveredWorkout, setHoveredWorkout] = useState<{
    date: moment.Moment
    workout: { type: string; reps: number; totalReps: number }
    position: { x: number; y: number }
  } | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchWorkouts = async () => {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('workout_date', { ascending: true })

      if (error) {
        console.error('Error fetching workouts:', error)
        return
      }

      if (data) {
        setWorkoutDates(data)
      }
    }

    fetchWorkouts()
  }, [])

  const isDayBlocked = useCallback((day: moment.Moment) => {
    return !workoutDates.some((workout) => 
      moment(workout.workout_date).isSame(day, 'day')  
    )
  }, [workoutDates])

  const renderDayContents = useCallback((day: moment.Moment) => {
    const hasWorkout = workoutDates.some((workout) => 
      moment(workout.workout_date).isSame(day, 'day')
    )

    return (
      <div 
        className={cn(
          "aspect-square flex items-center justify-center relative cursor-pointer transition-colors duration-200",
          !day.isSame(currentDate, 'month') ? "text-gray-600" : "",
          day.isSame(moment(), 'day') ? "bg-cyan-400/20" : "",
          hasWorkout ? "font-semibold" : "",
          "hover:bg-cyan-400/20 rounded-full"
        )}
        onMouseEnter={(e) => handleDayHover(day, e)}
        onMouseLeave={handleDayLeave}
      >
        <span className="z-10">{day.format('D')}</span>
        {hasWorkout && <div className="absolute inset-1 bg-cyan-400/20 rounded-full" />}
      </div>
    )
  }, [currentDate, workoutDates])

  const handleDayHover = useCallback(
    (day: moment.Moment, event: React.MouseEvent<HTMLDivElement>) => {
      if (!calendarRef.current) return

      const workout = workoutDates.find((w) => moment(w.workout_date).isSame(day, 'day'))
      if (workout) {
        const rect = calendarRef.current.getBoundingClientRect()
        setHoveredWorkout({
          date: day,
          workout: {
            type: "workout",
            reps: workout.reps,
            totalReps: workout.reps, // Add total reps
          },
          position: {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          },
        })
      } else {
        setHoveredWorkout(null)
      }
    },
    [workoutDates],
  )

  const handleDayLeave = useCallback(() => {
    setHoveredWorkout(null)
  }, [])

  const getProgressSymbol = useCallback((week: moment.Moment[]) => {
    const workoutCount = workoutDates.filter((workout) => 
      week.some((day) => moment(workout.workout_date).isSame(day, 'day'))
    ).length

    if (workoutCount >= 3) {
      return (
        <span className="material-symbols-outlined text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      )
    } else if (workoutCount === 2) {
      return (
        <span className="material-symbols-outlined text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>
          clock_loader_60  
        </span>
      )
    } else if (workoutCount === 1) {
      return (
        <span className="material-symbols-outlined text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>
          clock_loader_40
        </span>  
      )
    } else {
      return (
        <span className="material-symbols-outlined text-green-500" style={{ fontVariationSettings: "'FILL' 0" }}>
          circle
        </span>
      )
    }
  }, [workoutDates])

  const renderWeekFooter = useCallback((week: moment.Moment[]) => {
    return (
      <div className="aspect-square flex items-center justify-center">
        {getProgressSymbol(week)}
      </div>  
    )
  }, [getProgressSymbol])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
      />
      <Card className={cn("w-full", className)} ref={calendarRef}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Monthly View</CardTitle>  
        </CardHeader>
        <CardContent>
          <DayPickerSingleDateController
            date={currentDate}
            onDateChange={setCurrentDate}
            focused={true}
            onFocusChange={() => {}}
            numberOfMonths={1}
            isDayBlocked={isDayBlocked}
            renderDayContents={renderDayContents}
            renderWeekFooter={renderWeekFooter}
          />
        </CardContent>
        {hoveredWorkout && (
          <WorkoutPopup
            workout={hoveredWorkout.workout}
            position={hoveredWorkout.position}  
            calendarRect={calendarRef.current?.getBoundingClientRect() || null}
          />
        )}
      </Card>
    </>
  )
}

