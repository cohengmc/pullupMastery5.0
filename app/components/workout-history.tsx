"use client"

import { useState } from "react"
import { format, parse } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Edit2 } from "lucide-react"
import { WorkoutForm } from "./workout-form"
import { cn } from "@/lib/utils"
import { useWorkouts, Workout } from "@/hooks/use-workouts"

export function WorkoutHistory({ className }: { className?: string }) {
  const [currentPage, setCurrentPage] = useState(0)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const { workouts, loading: isLoading } = useWorkouts()
  const itemsPerPage = 10
  const totalPages = Math.ceil(workouts.length / itemsPerPage)

  // Sort workouts by date (most recent first) and paginate
  const paginatedData = [...workouts]
    .sort((a, b) => new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime())
    .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

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
                      title="Edit Workout"
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
          <Button 
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))} 
            disabled={currentPage === 0}
            title="View previous page of workout history"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span>
            Page {currentPage + 1} of {Math.max(1, totalPages)}
          </span>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage === totalPages - 1}
            title="View next page of workout history"
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
            window.location.reload();
          }}
        />
      )}
    </Card>
  )
}

