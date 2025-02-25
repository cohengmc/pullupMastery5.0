"use client"

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

interface WorkoutChartProps {
  data: number[]
}

export function WorkoutChart({ data }: WorkoutChartProps) {
  const chartData = data.map((reps, index) => ({
    set: `Set ${index + 1}`,
    reps: reps,
  }))

  const maxReps = Math.max(...data, 1) // Ensure at least 1 to avoid empty chart

  return (
    <div className="w-full h-full bg-gray-900/30 rounded-lg p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <XAxis 
            dataKey="set" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickCount={5}
            domain={[0, "dataMax + 5"]}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: "hsl(var(--background))", 
              border: "1px solid hsl(var(--border))", 
              borderRadius: "var(--radius)" 
            }}
            labelStyle={{ color: "hsl(var(--primary))" }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Bar dataKey="reps" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

