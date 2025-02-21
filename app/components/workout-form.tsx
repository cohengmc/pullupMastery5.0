"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface WorkoutFormProps {
  date: Date
  formType: "add" | "edit"
  workout?: {
    workout_date: string
    reps: number[]
    workout_extra_info: Array<{
      extra_info_options: {
        option_name: string
      }
    }>
  }
  onClose: () => void
}

export function WorkoutForm({ date, formType, workout, onClose }: WorkoutFormProps) {
  const [workoutType, setWorkoutType] = useState("max-day")
  const [reps, setReps] = useState<number[]>([0, 0, 0])
  const [extraInfo, setExtraInfo] = useState("")

  useEffect(() => {
    if (workout) {
      // Determine workout type based on number of reps
      const type = workout.reps.length === 3 ? "max-day" 
                  : workout.reps.length === 10 ? "sub-max-volume" 
                  : "ladder-volume"
      setWorkoutType(type)
      setReps(workout.reps)
      // Handle extra info if needed
    } else {
      setWorkoutType("max-day")
      setReps(Array(3).fill(0))
      setExtraInfo("")
    }
  }, [workout])

  const handleWorkoutTypeChange = (value: string) => {
    setWorkoutType(value)
    // Set appropriate number of reps based on workout type
    const repCount = value === "max-day" ? 3 
                    : value === "sub-max-volume" ? 10 
                    : 5
    setReps(Array(repCount).fill(0))
  }

  const handleRepChange = (index: number, value: string) => {
    const newReps = [...reps]
    // Convert string input to number, default to 0 if invalid
    newReps[index] = value === "" ? 0 : parseInt(value, 10) || 0
    setReps(newReps)
  }

  const handleSubmit = async () => {
    const workoutData = {
      workout_date: format(date, "yyyy-MM-dd"),
      reps: reps,
      // Add any extra info handling here
    }

    // In a real application, you would send this data to your backend
    console.log(formType === "add" ? "New workout:" : "Updated workout:", workoutData)

    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{formType === "add" ? "Add New Workout" : "Edit Workout"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <div className="col-span-3">{format(date, "MMMM d, yyyy")}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="workout-type" className="text-right">
              Type
            </Label>
            <Select value={workoutType} onValueChange={handleWorkoutTypeChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select workout type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="max-day">Max Day</SelectItem>
                <SelectItem value="sub-max-volume">Sub Max Volume</SelectItem>
                <SelectItem value="ladder-volume">Ladder Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {reps.map((rep, index) => (
            <div key={index} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`rep-${index}`} className="text-right">
                Set {index + 1}
              </Label>
              <Input
                id={`rep-${index}`}
                type="number"
                value={rep || ""}
                onChange={(e) => handleRepChange(index, e.target.value)}
                className="col-span-3"
                min="0"
              />
            </div>
          ))}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="extra-info" className="text-right">
              Extra Info
            </Label>
            <Input
              id="extra-info"
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{formType === "add" ? "Add Workout" : "Save Changes"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

