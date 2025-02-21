"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  parse,
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns"
import { WorkoutPopup } from "./workout-popup"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Progress"]

export function WorkoutCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hoveredWorkout, setHoveredWorkout] = useState<{
    date: Date
    workout: { type: string; reps: string; totalReps: number }
    position: { x: number; y: number }
  } | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const [calendarRect, setCalendarRect] = useState<DOMRect | null>(null)
  const [workoutDates, setWorkoutDates] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    const fetchWorkouts = async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          workout_id,
          user_id,
          workout_date,
          reps,
          created_at,
          updated_at,
          workout_extra_info (
            option_id,
            extra_info_options (
              option_name
            )
          )
        `)
      if (error) console.error("error", error)
      else setWorkoutDates(data.map(workout => ({
        ...workout,
        date: parse(workout.workout_date, "yyyy-MM-dd", new Date()),
      })))
    }

    fetchWorkouts()
  }, [currentDate])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Group calendar days into weeks
  const calendarWeeks = calendarDays.reduce((weeks: Date[][], day, i) => {
    const weekIndex = Math.floor(i / 7)
    weeks[weekIndex] = weeks[weekIndex] || []
    weeks[weekIndex].push(day)
    return weeks
  }, [])

  const getWorkoutsInWeek = (week: Date[]): number => {
    return workoutDates.filter((workout) => week.some((day) => isSameDay(day, workout.date))).length
  }

  const getProgressSymbol = (workoutCount: number) => {
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
  }

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const handleDayHover = useCallback(
    (day: Date, event: React.MouseEvent<HTMLDivElement>) => {
      if (!calendarRect) return

      const workout = workoutDates.find((w) => isSameDay(w.date, day))
      if (workout) {
        const totalReps = workout.reps.split(",").reduce((sum, rep) => sum + Number.parseInt(rep), 0)
        const rect = event.currentTarget.getBoundingClientRect()
        setHoveredWorkout({
          date: day,
          workout: {
            type: workout.type,
            reps: workout.reps,
            totalReps,
          },
          position: {
            x: rect.left - calendarRect.left,
            y: rect.top - calendarRect.top,
          },
        })
      } else {
        setHoveredWorkout(null)
      }
    },
    [workoutDates, calendarRect],
  )

  const handleDayLeave = useCallback(() => {
    setHoveredWorkout(null)
  }, [])

  useEffect(() => {
    const updateCalendarRect = () => {
      if (calendarRef.current) {
        setCalendarRect(calendarRef.current.getBoundingClientRect())
      }
    }

    updateCalendarRect()
    window.addEventListener("resize", updateCalendarRect)

    return () => {
      window.removeEventListener("resize", updateCalendarRect)
    }
  }, [])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
      />
      <Card className="w-full relative" ref={calendarRef}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Monthly View</CardTitle>
          <div className="flex items-center space-x-2">
            <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-700">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</span>
            <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-700">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-1">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-400">
                {day}
              </div>
            ))}
            {calendarWeeks.map((week, weekIndex) => (
              <>
                {week.map((day, dayIndex) => {
                  const hasWorkout = workoutDates.some((workout) => isSameDay(workout.date, day))
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  return (
                    <div
                      key={day.toString() + dayIndex}
                      className={`aspect-square flex items-center justify-center relative cursor-pointer transition-colors duration-200 
                        ${!isCurrentMonth ? "text-gray-600" : ""}
                        ${isToday(day) ? "bg-cyan-400/20" : ""}
                        ${hasWorkout ? "font-semibold" : ""}
                        hover:bg-cyan-400/20 rounded-full`}
                      // onMouseEnter={(e) => handleDayHover(day, e)}
                      // onMouseLeave={handleDayLeave}
                    >
                      <span className="z-10">{format(day, "d")}</span>
                      {hasWorkout && <div className="absolute inset-1 bg-cyan-400/20 rounded-full" />}
                    </div>
                  )
                })}
                <div key={`progress-${weekIndex}`} className="aspect-square flex items-center justify-center">
                  {getProgressSymbol(getWorkoutsInWeek(week))}
                </div>
              </>
            ))}
          </div>
        </CardContent>
        {hoveredWorkout && calendarRect && (
          <WorkoutPopup
            workout={hoveredWorkout.workout}
            position={hoveredWorkout.position}
            calendarRect={calendarRect}
          />
        )}
      </Card>
    </>
  )
}

