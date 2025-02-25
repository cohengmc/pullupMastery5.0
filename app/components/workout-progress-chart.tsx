"use client"

import { useState, useMemo } from "react"
import { format, parseISO } from "date-fns"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useWorkouts } from "@/hooks/use-workouts"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type WorkoutType = "All" | "Max Day" | "Sub Max" | "Ladder"

const sumLadderSet = (reps: number) => {
  return Array.from({ length: reps }, (_, i) => reps - i).reduce((a, b) => a + b, 0)
}

const getColorsForWorkout = (sets: number[], type: string) => {
  const colors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#9B59B6"]
  if (type === "Max Day") {
    return colors.slice(0, 3) // Use the first three colors for Max Day
  }
  const uniqueReps = Array.from(new Set(sets)).sort((a, b) => b - a)
  const colorMap = new Map(uniqueReps.map((rep, index) => [rep, colors[index % colors.length]]))
  return sets.map((rep) => colorMap.get(rep) || "#CCCCCC")
}

export function WorkoutProgressChart({ className }: { className?: string }) {
  const [selectedType, setSelectedType] = useState<WorkoutType>("All")
  const [showSets, setShowSets] = useState(true)
  const { workouts, loading, error } = useWorkouts()

  const chartData = useMemo(() => {
    if (!workouts.length) return []

    return workouts
      .map((workout) => {
        const sets = workout.reps
        const type = sets.length === 3 ? "Max Day" : sets.length === 10 ? "Sub Max" : "Ladder"

        if (selectedType !== "All" && type !== selectedType) return null

        const processedSets = type === "Ladder" ? sets.map(sumLadderSet) : sets
        const total = processedSets.reduce((a, b) => a + b, 0)
        const colors = getColorsForWorkout(sets, type)

        return {
          date: format(parseISO(workout.workout_date), "MMM d"),
          type,
          total,
          originalSets: sets,
          colors,
          ...(showSets &&
            processedSets.reduce(
              (acc, value, index) => {
                acc[`set${index + 1}`] = value
                return acc
              },
              {} as Record<string, number>,
            )),
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .reverse()
  }, [workouts, selectedType, showSets])

  const maxValue = useMemo(() => {
    if (!chartData.length) return 100
    const max = Math.max(...chartData.map((data) => data.total))
    return Math.ceil(max / 10) * 10 + 10
  }, [chartData])

  if (loading) {
    return <Skeleton className="w-full h-[500px]" />
  }

  if (error || !chartData.length) {
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
        <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
          <p className="text-cyan-400 font-semibold">{label}</p>
          <p className="text-white">{data.type}</p>
          <p className="text-white">Total: {data.total}</p>
          {data.originalSets && <p className="text-white">Sets: {data.originalSets.join(", ")}</p>}
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
          <div className="flex items-center space-x-2">
            <Switch id="show-sets" checked={showSets} onCheckedChange={setShowSets} />
            <Label htmlFor="show-sets">Show Sets</Label>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <ToggleGroup
            type="single"
            value={selectedType}
            onValueChange={(value) => value && setSelectedType(value as WorkoutType)}
          >
            <ToggleGroupItem value="All" aria-label="Show all workouts">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="Max Day" aria-label="Show max day workouts">
              Max Day
            </ToggleGroupItem>
            <ToggleGroupItem value="Sub Max" aria-label="Show sub max workouts">
              Sub Max
            </ToggleGroupItem>
            <ToggleGroupItem value="Ladder" aria-label="Show ladder workouts">
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
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              barGap={2}
              barSize={18}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <YAxis domain={[0, maxValue]} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {showSets ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <Bar
                    key={`set${i + 1}`}
                    dataKey={`set${i + 1}`}
                    stackId="a"
                    fill="rgba(0,0,0,0)"
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
              ) : (
                <Bar dataKey="total" fill="rgb(34 211 238)" name="Total Reps" />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

