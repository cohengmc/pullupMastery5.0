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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WorkoutFormProps {
  date?: Date
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

export function WorkoutForm({ date, formType: initialFormType, workout: initialWorkout, onClose, onWorkoutChange }: WorkoutFormProps) {
  const supabase = createClient()
  const [selectedDate, setSelectedDate] = useState<Date>(date || new Date())
  const [workoutType, setWorkoutType] = useState("max-day")
  const [reps, setReps] = useState<number[]>([0, 0, 0])
  const [extraInfoOptions, setExtraInfoOptions] = useState<ExtraInfoOption[]>([])
  const [selectedExtraInfo, setSelectedExtraInfo] = useState<string[]>([])
  const [existingWorkout, setExistingWorkout] = useState<typeof initialWorkout | null>(initialWorkout || null)
  const [formType, setFormType] = useState(initialFormType)

  // Initialize form with initial workout data if provided
  useEffect(() => {
    if (initialWorkout) {
      setExistingWorkout(initialWorkout)
      const type = initialWorkout.reps.length === 3 ? "max-day" 
                  : initialWorkout.reps.length === 10 ? "sub-max-volume" 
                  : "ladder-volume"
      setWorkoutType(type)
      setReps(initialWorkout.reps)
      const selectedInfo = initialWorkout.workout_extra_info.map((info: { option_id: number }) => 
        info.option_id.toString()
      )
      setSelectedExtraInfo(selectedInfo)
    }
  }, [initialWorkout])

  // Check for existing workout on date change
  useEffect(() => {
    const checkExistingWorkout = async () => {
      // Skip check if we're editing an existing workout
      if (initialWorkout) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_extra_info (
            option_id,
            extra_info_options (
              option_name
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('workout_date', format(selectedDate, 'yyyy-MM-dd'))
        .maybeSingle()

      if (error) {
        console.error('Error checking for existing workout:', error)
        return
      }

      if (data) {
        setExistingWorkout(data)
        setFormType("edit")
        const type = data.reps.length === 3 ? "max-day" 
                    : data.reps.length === 10 ? "sub-max-volume" 
                    : "ladder-volume"
        setWorkoutType(type)
        setReps(data.reps)
        const selectedInfo = data.workout_extra_info.map((info: { option_id: number }) => 
          info.option_id.toString()
        )
        setSelectedExtraInfo(selectedInfo)
      } else {
        setExistingWorkout(null)
        setFormType("add")
        setWorkoutType("max-day")
        setReps(Array(3).fill(0))
        setSelectedExtraInfo([])
      }
    }

    checkExistingWorkout()
  }, [selectedDate, initialWorkout, supabase])

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to save a workout")
        return
      }

      const workoutData = {
        workout_date: format(selectedDate, "yyyy-MM-dd"),
        reps,
        user_id: user.id
      }

      let workoutId: number | undefined

      if (formType === "add") {
        // Create new workout
        const { data, error } = await supabase
          .from('workouts')
          .insert([workoutData])
          .select()

        if (error) throw error
        workoutId = data?.[0]?.workout_id

      } else if (formType === "edit" && existingWorkout?.workout_id) {
        // Update existing workout
        const { error: updateError } = await supabase
          .from('workouts')
          .update(workoutData)
          .eq('workout_id', existingWorkout.workout_id)

        if (updateError) throw updateError
        workoutId = existingWorkout.workout_id

        // Delete existing extra info
        await supabase
          .from('workout_extra_info')
          .delete()
          .eq('workout_id', workoutId)
      }

      // Add/update extra info if we have a workout ID
      if (workoutId) {
        const extraInfoData = selectedExtraInfo.map(optionId => ({
          workout_id: workoutId,
          option_id: parseInt(optionId)
        }))

        const { error: extraInfoError } = await supabase
          .from('workout_extra_info')
          .insert(extraInfoData)

        if (extraInfoError) throw extraInfoError
      }

      toast.success(formType === "add" ? "Workout added successfully" : "Workout updated successfully")
      onWorkoutChange()
      onClose()
    } catch (error) {
      console.error('Error saving workout:', error)
      toast.error("Failed to save workout")
    }
  }

  const handleDelete = async () => {
    if (!existingWorkout?.workout_id || formType !== "edit") return

    try {
      // Delete workout_extra_info first (due to foreign key constraint)
      const { error: extraInfoError } = await supabase
        .from('workout_extra_info')
        .delete()
        .eq('workout_id', existingWorkout.workout_id)

      if (extraInfoError) throw extraInfoError

      // Then delete the workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('workout_id', existingWorkout.workout_id)

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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {existingWorkout && formType === "add" && (
            <Alert>
              <AlertDescription>
                A workout already exists for this date. You can edit the existing workout instead.
              </AlertDescription>
            </Alert>
          )}

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
          <Button 
            onClick={handleSubmit}
            disabled={formType === "add" && existingWorkout !== null}
          >
            {formType === "add" ? "Add Workout" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

