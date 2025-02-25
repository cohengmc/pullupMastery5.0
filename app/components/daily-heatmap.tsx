"use client"

import { useMemo } from "react"
import { Group } from "@visx/group"
import { HeatmapRect } from "@visx/heatmap"
import { scaleLinear } from "@visx/scale"
import { eachDayOfInterval, subDays, isSameDay, parseISO } from "date-fns"
import { useWorkouts } from "@/hooks/use-workouts"
import { Skeleton } from "@/components/ui/skeleton"

interface BinDatum {
  bin: number
  count: number
}

interface Bin {
  bin: number
  bins: BinDatum[]
}

const width = 800
const height = 140
const margin = { top: 10, right: 20, bottom: 10, left: 20 }
const days = 365

// Color scales
const colorMax = 1
const bucketSizeMax = 1

// Accessors
const bins = (d: Bin) => d.bins
const count = (d: BinDatum) => d.count

export function DailyHeatmap() {
  const { workouts, loading, error } = useWorkouts()

  // Process workout data into heatmap format
  const data = useMemo(() => {
    if (!workouts.length) return []

    const today = new Date()
    const startDate = subDays(today, days)

    // Create array of all dates in range
    const datesInRange = eachDayOfInterval({ start: startDate, end: today })

    // Parse workout dates
    const workoutDates = workouts.map(workout => parseISO(workout.workout_date))

    // Create weeks array (7 days per week)
    const weeks: Bin[] = []
    let currentWeek: BinDatum[] = []

    datesInRange.forEach((date, i) => {
      const hasWorkout = workoutDates.some((workoutDate) => isSameDay(date, workoutDate))

      currentWeek.push({
        bin: date.getDay(),
        count: hasWorkout ? 1 : 0,
      })

      if (currentWeek.length === 7 || i === datesInRange.length - 1) {
        weeks.push({
          bin: weeks.length,
          bins: currentWeek,
        })
        currentWeek = []
      }
    })

    return weeks
  }, [workouts])

  if (loading) {
    return <Skeleton className="w-full h-[140px]" />
  }

  if (error || !data.length) {
    return <div className="text-muted-foreground text-center py-4">No workout data available</div>
  }

  // Scales
  const xScale = scaleLinear<number>({
    domain: [0, data.length],
    range: [0, width - margin.left - margin.right],
  })

  const yScale = scaleLinear<number>({
    domain: [0, 6],
    range: [0, height - margin.top - margin.bottom],
  })

  const colorScale = scaleLinear<string>({
    domain: [0, colorMax],
    range: ["hsl(var(--muted))", "hsl(var(--primary))"]
  })

  const opacityScale = scaleLinear<number>({
    domain: [0, bucketSizeMax],
    range: [0.3, 1],
  })

  return (
    <div className="relative w-full overflow-x-auto">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <Group top={margin.top} left={margin.left}>
          <HeatmapRect
            data={data}
            xScale={xScale}
            yScale={yScale}
            colorScale={colorScale}
            opacityScale={opacityScale}
            binWidth={14}
            binHeight={14}
            gap={4}
          >
            {(heatmap) =>
              heatmap.map((heatmapBins) =>
                heatmapBins.map((bin) => (
                  <rect
                    key={`heatmap-rect-${bin.row}-${bin.column}`}
                    className="transition-colors duration-300"
                    width={bin.width}
                    height={bin.height}
                    x={bin.x}
                    y={bin.y}
                    fill={bin.color}
                    fillOpacity={bin.opacity}
                    rx={2}
                  />
                )),
              )
            }
          </HeatmapRect>
        </Group>
      </svg>
    </div>
  )
}

