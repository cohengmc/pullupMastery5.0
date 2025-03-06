"use client"

import { useState, useCallback, useRef, useEffect, Fragment } from "react"
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
  parseISO
} from "date-fns"
import { WorkoutForm } from "./workout-form"
import { useWorkouts } from "@/hooks/use-workouts"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Progress"]

const sumLadderSet = (reps: number) => {
  return Array.from({ length: reps }, (_, i) => reps - i).reduce((a, b) => a + b, 0)
}

const CalendarTooltip = ({ workout, date }: { 
  workout: { 
    reps: number[]
    workout_extra_info: Array<{
      extra_info_options: {
        option_name: string
      }
    }>
  }
  date: Date 
}) => {
  const type = workout.reps.length === 3 ? "Max Day" 
              : workout.reps.length === 10 ? "Sub Max" 
              : "Ladder"

  const total = type === "Ladder"
    ? workout.reps.reduce((sum, rep) => sum + sumLadderSet(rep), 0)
    : workout.reps.reduce((sum, rep) => sum + rep, 0)

  return (
    <div className="bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg pointer-events-none z-[1000] border border-border">
      <p className="text-primary font-semibold">{format(date, 'MMM d')}</p>
      <p className="text-foreground">{type}</p>
      <p className="text-foreground">Sets: {workout.reps.join(', ')}</p>
      <p className="text-foreground">Total: {total}</p>
    </div>
  )
}

interface WorkoutCalendarProps {
  className?: string;
}

export function WorkoutCalendar({ className }: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tooltip, setTooltip] = useState<{
    workout: any
    date: Date
    mouseX: number
    mouseY: number
  } | null>(null)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [formType, setFormType] = useState<"add" | "edit" | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const [calendarRect, setCalendarRect] = useState<DOMRect | null>(null)
  const { workouts, loading } = useWorkouts()

  // Process workouts to include parsed dates
  const workoutDates = workouts.map(workout => ({
    ...workout,
    date: parseISO(workout.workout_date)
  }))

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

  const handleDayInteraction = useCallback(
    (day: Date, event: React.MouseEvent<HTMLDivElement>) => {
      const workout = workoutDates.find((w) => isSameDay(w.date, day))
      
      if (event.type === "mouseenter") {
        if (workout) {
          setTooltip({
            workout,
            date: day,
            mouseX: event.clientX,
            mouseY: event.clientY
          })
        }
      } else if (event.type === "click") {
        setSelectedDay(day)
        setFormType(workout ? "edit" : "add")
      }
    },
    [workoutDates]
  )

  const handleDayLeave = useCallback(() => {
    setTooltip(null)
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

  if (loading) {
    return <Skeleton className="w-full h-[500px]" />
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
      />
      <Card className={cn("w-full relative", className)} ref={calendarRef}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Monthly View</CardTitle>
          <div className="flex items-center space-x-2">
            <button 
              onClick={prevMonth} 
              className="p-1 rounded-full hover:bg-accent"
              title="View previous month"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</span>
            <button 
              onClick={nextMonth} 
              className="p-1 rounded-full hover:bg-accent"
              title="View next month"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-1">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
            {calendarWeeks.map((week, weekIndex) => (
              <Fragment key={`week-${weekIndex}`}>
                {week.map((day, dayIndex) => {
                  const hasWorkout = workoutDates.some((workout) => isSameDay(workout.date, day))
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  return (
                    <div
                      key={day.toString() + dayIndex}
                      className={`aspect-square flex items-center justify-center relative cursor-pointer transition-colors duration-200 
                        ${!isCurrentMonth ? "text-muted-foreground/50" : ""}
                        ${isToday(day) ? "bg-primary/20" : ""}
                        ${hasWorkout ? "font-semibold" : ""}
                        hover:bg-primary/20 rounded-full`}
                      onMouseEnter={(e) => handleDayInteraction(day, e)}
                      onMouseLeave={handleDayLeave}
                      onClick={(e) => handleDayInteraction(day, e)}
                    >
                      <span className="z-10">{format(day, "d")}</span>
                      {hasWorkout && <div className="absolute inset-1 bg-primary/20 rounded-full" />}
                    </div>
                  )
                })}
                <div key={`progress-${weekIndex}`} className="aspect-square flex items-center justify-center">
                  {getProgressSymbol(getWorkoutsInWeek(week))}
                </div>
              </Fragment>
            ))}
          </div>
        </CardContent>
        {tooltip && (
          <div
            style={{
              position: 'fixed',
              left: tooltip.mouseX,
              top: tooltip.mouseY - 10,
            }}
          >
            <CalendarTooltip
              workout={tooltip.workout}
              date={tooltip.date}
            />
          </div>
        )}
        {selectedDay && formType && (
          <WorkoutForm
            date={selectedDay}
            formType={formType}
            workout={workoutDates.find((w) => isSameDay(w.date, selectedDay))}
            onClose={() => {
              setSelectedDay(null)
              setFormType(null)
            }}
            onWorkoutChange={() => {
              window.location.reload();
            }}
          />
        )}
      </Card>
    </>
  )
}

