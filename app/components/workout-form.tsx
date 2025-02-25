"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/multi-select"
import { toast } from "sonner"

interface WorkoutFormProps {
  date: Date
  formType: "add" | "edit"
  workout?: {
    workout_id?: number
    workout_date: string
    reps: number[]
    workout_extra_info: Array<{
      option_id: number
      extra_info_options: {
        option_name: string
      }
    }>
  }
  onClose: () => void
  onWorkoutChange: () => void
}

interface ExtraInfoOption {
  value: string
  label: string
}

export function WorkoutForm({ date, formType, workout, onClose, onWorkoutChange }: WorkoutFormProps) {
  const supabase = createClient()
  const [workoutType, setWorkoutType] = useState("max-day")
  const [reps, setReps] = useState<number[]>([0, 0, 0])
  const [extraInfoOptions, setExtraInfoOptions] = useState<ExtraInfoOption[]>([])
  const [selectedExtraInfo, setSelectedExtraInfo] = useState<string[]>([])

  // Fetch extra info options from Supabase
  useEffect(() => {
    const fetchExtraInfoOptions = async () => {
      const { data, error } = await supabase
        .from('extra_info_options')
        .select('option_id, option_name')

      if (error) {
        console.error('Error fetching extra info options:', error)
        return
      }

      setExtraInfoOptions(
        data.map(option => ({
          value: option.option_id.toString(),
          label: option.option_name
        }))
      )
    }

    fetchExtraInfoOptions()
  }, [])

  // Set initial values when editing
  useEffect(() => {
    if (workout) {
      const type = workout.reps.length === 3 ? "max-day" 
                  : workout.reps.length === 10 ? "sub-max-volume" 
                  : "ladder-volume"
      setWorkoutType(type)
      setReps(workout.reps)
      
      // Set selected extra info from workout data
      const selectedInfo = workout.workout_extra_info.map(info => 
        info.option_id.toString()
      )
      setSelectedExtraInfo(selectedInfo)
    } else {
      setWorkoutType("max-day")
      setReps(Array(3).fill(0))
      setSelectedExtraInfo([])
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
    try {
      const workoutData = {
        workout_date: format(date, "yyyy-MM-dd"),
        reps,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }

      if (formType === "add") {
        // Create new workout
        const { data, error } = await supabase
          .from('workouts')
          .insert([workoutData])
          .select()

        if (error) throw error

        // Add workout type and extra info
        if (data?.[0]?.workout_id) {
          const extraInfoData = selectedExtraInfo.map(optionId => ({
            workout_id: data[0].workout_id,
            option_id: parseInt(optionId)
          }))

          const { error: extraInfoError } = await supabase
            .from('workout_extra_info')
            .insert(extraInfoData)

          if (extraInfoError) throw extraInfoError
        }

        toast.success("Workout added successfully")
      } else if (formType === "edit" && workout?.workout_id) {
        // Update existing workout
        const { error: updateError } = await supabase
          .from('workouts')
          .update(workoutData)
          .eq('workout_id', workout.workout_id)

        if (updateError) throw updateError

        // Delete existing extra info
        await supabase
          .from('workout_extra_info')
          .delete()
          .eq('workout_id', workout.workout_id)

        // Insert new extra info
        const extraInfoData = selectedExtraInfo.map(optionId => ({
          workout_id: workout.workout_id,
          option_id: parseInt(optionId)
        }))

        const { error: extraInfoError } = await supabase
          .from('workout_extra_info')
          .insert(extraInfoData)

        if (extraInfoError) throw extraInfoError

        toast.success("Workout updated successfully")
      }

      onWorkoutChange()
      onClose()
    } catch (error) {
      console.error('Error saving workout:', error)
      toast.error("Failed to save workout")
    }
  }

  const handleDelete = async () => {
    if (!workout?.workout_id || formType !== "edit") return

    try {
      // Delete workout_extra_info first (due to foreign key constraint)
      const { error: extraInfoError } = await supabase
        .from('workout_extra_info')
        .delete()
        .eq('workout_id', workout.workout_id)

      if (extraInfoError) throw extraInfoError

      // Then delete the workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('workout_id', workout.workout_id)

      if (workoutError) throw workoutError

      toast.success("Workout deleted successfully")
      onWorkoutChange()
      onClose()
    } catch (error) {
      console.error('Error deleting workout:', error)
      toast.error("Failed to delete workout")
    }
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
            <div className="col-span-3">
              <MultiSelect
                options={extraInfoOptions}
                selected={selectedExtraInfo}
                onChange={setSelectedExtraInfo}
                placeholder="Select extra info..."
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          {formType === "edit" && (
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
          )}
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {formType === "add" ? "Add Workout" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

