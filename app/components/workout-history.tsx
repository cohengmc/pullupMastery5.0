"use client"

import { useState, useEffect } from "react"
import { format, parse } from "date-fns"
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Trash2, Edit2 } from "lucide-react"
import { WorkoutForm } from "./workout-form"
import { cn } from "@/lib/utils"

interface Workout {
  workout_id: number
  workout_date: string
  reps: number[]
  workout_extra_info: Array<{
    option_id: number
    extra_info_options: {
      option_name: string
    }
  }>
}

export function WorkoutHistory({ className }: { className?: string }) {
  const supabase = createClient()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 10
  const totalPages = Math.ceil(workouts.length / itemsPerPage)

  const fetchWorkouts = async () => {
    setIsLoading(true)
    try {
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select(`
          workout_id,
          workout_date,
          reps,
          workout_extra_info (
            option_id,
            extra_info_options (
              option_name
            )
          )
        `)
        .order('workout_date', { ascending: false })

      if (workoutError) throw workoutError

      setWorkouts(workoutData || [])
    } catch (error) {
      console.error('Error fetching workouts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const paginatedData = workouts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  const handleEditClick = (workout: Workout) => {
    setEditingWorkout(workout)
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Workout History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reps</TableHead>
              <TableHead>Extra Info</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : paginatedData.map((workout) => (
              <TableRow key={workout.workout_id}>
                <TableCell>
                  {format(parse(workout.workout_date, 'yyyy-MM-dd', new Date()), "MMM d, yyyy")}
                </TableCell>
                <TableCell>{workout.reps.join(", ")}</TableCell>
                <TableCell>
                  {workout.workout_extra_info
                    .map(info => info.extra_info_options.option_name)
                    .join(", ")}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:text-primary/70 hover:bg-primary/10"
                      onClick={() => handleEditClick(workout)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          <Button onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))} disabled={currentPage === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      {editingWorkout && (
        <WorkoutForm
          date={parse(editingWorkout.workout_date, 'yyyy-MM-dd', new Date())}
          formType="edit"
          workout={editingWorkout}
          onClose={() => setEditingWorkout(null)}
          onWorkoutChange={() => {
            fetchWorkouts()
            setEditingWorkout(null)
          }}
        />
      )}
    </Card>
  )
}

