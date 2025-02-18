"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DailyHeatmap } from "./daily-heatmap"
import { WeeklyHeatmap } from "./weekly-heatmap"
import { cn } from "@/lib/utils"

export function WorkoutHeatmap({ className }: { className?: string }) {
  const [showWeekly, setShowWeekly] = useState(false)

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Yearly Activity</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch id="view-mode" checked={showWeekly} onCheckedChange={setShowWeekly} />
            <Label htmlFor="view-mode">Weekly View</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={showWeekly ? "h-[240px]" : "h-[180px]"}>
          {showWeekly ? <WeeklyHeatmap /> : <DailyHeatmap />}
        </div>
      </CardContent>
    </Card>
  )
}

