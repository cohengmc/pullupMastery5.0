"use client"

import { useState } from "react"
import { format } from "date-fns"
import { PenSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SingleDatePicker } from "./single-date-picker"

export function AddWorkoutForm() {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | null>(null)
  const [workoutType, setWorkoutType] = useState("max-day")
  const [reps, setReps] = useState<string[]>(Array(3).fill(""))

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

    const newWorkout = {
      date: format(date, "MMMM d, yyyy"),
      type: "Pull",
      reps: reps.join(","),
    }

    // In a real application, you would send this data to your backend
    console.log("New workout:", newWorkout)

    // Reset form and close dialog
    setDate(new Date())
    setWorkoutType("max-day")
    setReps(Array(3).fill(""))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary">
          <PenSquare className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Workout</DialogTitle>
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
        </div>
        <Button onClick={handleSubmit}>Save Workout</Button>
      </DialogContent>
    </Dialog>
  )
}

