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
          <XAxis dataKey="set" tickLine={false} axisLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            tickCount={5}
            domain={[0, "dataMax + 5"]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1F2937", border: "none", borderRadius: "0.375rem" }}
            labelStyle={{ color: "#22D3EE" }}
            itemStyle={{ color: "#FFFFFF" }}
          />
          <Bar dataKey="reps" fill="#22D3EE" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

