"use client"

import { useState, useEffect } from "react"
import { format, parse } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SingleDatePicker } from "./single-date-picker"

interface EditWorkoutFormProps {
  workout: {
    date: string
    type: string
    reps: string
    extraInfo: string
  }
  onClose: () => void
}

export function EditWorkoutForm({ workout, onClose }: EditWorkoutFormProps) {
  const [date, setDate] = useState<Date | null>(null)
  const [workoutType, setWorkoutType] = useState(getWorkoutType(workout.reps))
  const [reps, setReps] = useState<string[]>(workout.reps.split(","))
  const [extraInfo, setExtraInfo] = useState(workout.extraInfo)

  useEffect(() => {
    setDate(parse(workout.date, "MMMM d, yyyy", new Date()))
  }, [workout.date])

  const handleWorkoutTypeChange = (value: string) => {
    setWorkoutType(value)
    setReps(Array(value === "max-day" ? 3 : value === "sub-max-volume" ? 10 : 5).fill(""))
  }

  const handleRepChange = (index: number, value: string) => {
    const newReps = [...reps]
    newReps[index] = value
    setReps(newReps)
  }

  const handleSubmit = () => {
    if (!date) return

    const updatedWorkout = {
      date: format(date, "MMMM d, yyyy"),
      type: "Pull",
      reps: reps.join(","),
      extraInfo,
    }

    // In a real application, you would send this data to your backend
    console.log("Updated workout:", updatedWorkout)

    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Workout</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <div className="col-span-3">
              <SingleDatePicker date={date} onChange={(date) => setDate(date)} />
            </div>
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
                value={rep}
                onChange={(e) => handleRepChange(index, e.target.value)}
                className="col-span-3"
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
          <Button onClick={handleSubmit}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getWorkoutType(reps: string): string {
  const repCount = reps.split(",").length
  if (repCount === 3) return "max-day"
  if (repCount === 10) return "sub-max-volume"
  if (repCount === 5) return "ladder-volume"
  return "unknown"
}

