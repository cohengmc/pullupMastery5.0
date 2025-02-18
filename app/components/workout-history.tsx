"use client"

import { useState } from "react"
import { format, parse } from "date-fns"
import workoutData from "../data/workoutData.json"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Trash2, Edit2 } from "lucide-react"
import { EditWorkoutForm } from "./edit-workout-form"
import { cn } from "@/lib/utils"

export function WorkoutHistory({ className }: { className?: string }) {
  const [currentPage, setCurrentPage] = useState(0)
  const [editingWorkout, setEditingWorkout] = useState<any | null>(null)
  const itemsPerPage = 10
  const totalPages = Math.ceil(workoutData.length / itemsPerPage)

  const paginatedData = workoutData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  const handleEditClick = (workout: any) => {
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
              <TableHead>Type</TableHead>
              <TableHead>Reps</TableHead>
              <TableHead>Extra Info</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((workout, index) => (
              <TableRow key={index}>
                <TableCell>{format(parse(workout.date, "MMMM d, yyyy", new Date()), "MMM d, yyyy")}</TableCell>
                <TableCell>{workout.type}</TableCell>
                <TableCell>{workout.reps}</TableCell>
                <TableCell>{workout.extraInfo}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-cyan-500 hover:text-cyan-700 hover:bg-cyan-100/10"
                      onClick={() => handleEditClick(workout)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100/10"
                    >
                      <Trash2 className="h-4 w-4" />
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
      {editingWorkout && <EditWorkoutForm workout={editingWorkout} onClose={() => setEditingWorkout(null)} />}
    </Card>
  )
}

