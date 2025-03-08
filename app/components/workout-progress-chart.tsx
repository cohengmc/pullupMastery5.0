"use client"

import { useState, useMemo } from "react"
import { format, parseISO, parse } from "date-fns"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useWorkouts } from "@/hooks/use-workouts"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type WorkoutType = "All" | "Max Day" | "Sub Max" | "Ladder"

interface DemoWorkout {
  date: string | Date
  reps: string | number[]
}

interface DbWorkout {
  workout_date: string
  reps: number[]
}

type WorkoutData = DemoWorkout | DbWorkout

const sumLadderSet = (reps: number) => {
  return Array.from({ length: reps }, (_, i) => reps - i).reduce((a, b) => a + b, 0)
}

const parseReps = (reps: string | number[]): number[] => {
  if (Array.isArray(reps)) return reps
  return reps.split(',').map(Number)
}

const getColorsForWorkout = (sets: number[], type: string, allWorkouts?: WorkoutData[]) => {
  if (type === "Max Day") {
    return ["#FF6B6B", "#FFD93D", "#6BCB77"] // Keep existing colors for Max Day
  }

  if (type === "Sub Max" && allWorkouts) {
    // Get all rep values from all Sub Max workouts
    const allReps = allWorkouts
      .filter(workout => {
        const sets = parseReps(workout.reps)
        return sets.length === 10 // Sub Max workouts have 10 sets
      })
      .flatMap(workout => parseReps(workout.reps))

    const minReps = Math.min(...allReps)
    const maxReps = Math.max(...allReps)
    const range = maxReps - minReps

    // Create a color map for each unique rep count
    const colorMap = new Map<number, string>()
    
    // Get unique rep values and sort them
    const uniqueReps = Array.from(new Set(allReps)).sort((a, b) => a - b)
    
    // Create colors interpolating between primary and foreground based on unique rep counts
    const colors = Array.from({ length: uniqueReps.length }, (_, i) => {
      const percentage = i / (uniqueReps.length - 1)
      // Mix between primary (end) and foreground (start) colors
      // Higher percentage = more primary = darker
      return `color-mix(in hsl, hsl(var(--foreground)) ${percentage * 100}%, hsl(var(--primary)))`
    })
    
    // Map rep counts to colors (higher reps get darker colors)
    uniqueReps.forEach((rep, index) => {
      // Reverse the color index mapping
      const colorIndex = uniqueReps.length - 1 - index
      colorMap.set(rep, colors[colorIndex])
    })

    // Return colors for each set based on its rep count
    return sets.map(rep => colorMap.get(rep) || colors[0])
  }

  // Default colors for other types
  const colors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#9B59B6"]
  const uniqueReps = Array.from(new Set(sets)).sort((a, b) => b - a)
  const colorMap = new Map(uniqueReps.map((rep, index) => [rep, colors[index % colors.length]]))
  return sets.map((rep) => colorMap.get(rep) || "#CCCCCC")
}

const parseDateString = (dateStr: string | Date): Date => {
  if (dateStr instanceof Date) return dateStr
  
  // If it contains commas, it's likely in "Month DD, YYYY" format
  if (dateStr.includes(',')) {
    return parse(dateStr, 'MMMM d, yyyy', new Date())
  }
  
  // Otherwise, try ISO format
  return parseISO(dateStr)
}

export function WorkoutProgressChart({ className, demoData }: { className?: string, demoData?: DemoWorkout[] }) {
  const [selectedType, setSelectedType] = useState<WorkoutType>("All")
  const { workouts, loading, error } = useWorkouts()

  const chartData = useMemo(() => {
    const dataToUse = (demoData || workouts) as WorkoutData[]
    if (!dataToUse.length) return []

    return dataToUse
      .map((workout) => {
        try {
          const sets = parseReps(workout.reps)
          const type = sets.length === 3 ? "Max Day" : sets.length === 10 ? "Sub Max" : "Ladder"

          if (selectedType !== "All" && type !== selectedType) return null

          const processedSets = type === "Ladder" ? sets.map(sumLadderSet) : sets
          const total = processedSets.reduce((a: number, b: number): number => a + b, 0)
          const colors = getColorsForWorkout(sets, type, dataToUse)

          // Handle different date formats
          const dateToFormat = 'workout_date' in workout 
            ? parseISO(workout.workout_date)
            : parseDateString(workout.date)

          return {
            date: format(dateToFormat, "MMM d"),
            type,
            total,
            originalSets: sets,
            colors,
            ...(selectedType !== "All" &&
              processedSets.reduce(
                (acc: Record<string, number>, value: number, index: number) => {
                  acc[`set${index + 1}`] = value
                  return acc
                },
                {} as Record<string, number>,
              )),
          }
        } catch (error) {
          console.error('Error processing workout:', workout, error)
          return null
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }, [workouts, selectedType, demoData])

  const maxValue = useMemo(() => {
    if (!chartData.length) return 100
    const max = Math.max(...chartData.map((data) => data.total))
    return Math.ceil(max / 10) * 10 + 10
  }, [chartData])

  if (loading && !demoData) {
    return <Skeleton className="w-full h-[500px]" />
  }

  if ((error || !chartData.length) && !demoData) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Workout Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-4">No workout data available</div>
        </CardContent>
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg pointer-events-none z-[1000] border border-border">
          <p className="text-primary font-semibold">{label}</p>
          <p className="text-foreground">{data.type}</p>
          <p className="text-foreground">Sets: {data.originalSets?.join(", ")}</p>
          <p className="text-foreground">Total: {data.total}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Workout Progress</CardTitle>
        </div>
        <div className="flex justify-center mt-4">
          <ToggleGroup
            type="single"
            value={selectedType}
            onValueChange={(value) => value && setSelectedType(value as WorkoutType)}
          >
            <ToggleGroupItem value="All" title="Show all workouts">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="Max Day" title="Show max day workouts">
              Max Day
            </ToggleGroupItem>
            <ToggleGroupItem value="Sub Max" title="Show sub max workouts">
              Sub Max
            </ToggleGroupItem>
            <ToggleGroupItem value="Ladder" title="Show ladder workouts">
              Ladder
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barGap={2}
              barSize={18}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <YAxis domain={[0, maxValue]} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedType === "All" ? (
                <Bar dataKey="total" fill="hsl(var(--primary))" name="Total Reps" />
              ) : selectedType === "Max Day" ? (
                // Max Day specific visualization with 3 sets
                Array.from({ length: 3 }).map((_, i) => (
                  <Bar
                    key={`set${i + 1}`}
                    dataKey={`set${i + 1}`}
                    stackId="a"
                    fill={["#FF6B6B", "#FFD93D", "#6BCB77"][i]}
                    name={`Set ${i + 1}`}
                  />
                ))
              ) : (
                // Sub Max and Ladder visualization
                Array.from({ length: 10 }).map((_, i) => (
                  <Bar
                    key={`set${i + 1}`}
                    dataKey={`set${i + 1}`}
                    stackId="a"
                    fill={["#FF6B6B", "#FFD93D", "#6BCB77"][i]}
                    name={`Set ${i + 1}`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.colors[i] || "#CCCCCC"} 
                        style={{ padding: "0.5px 0" }} 
                      />
                    ))}
                  </Bar>
                ))
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

