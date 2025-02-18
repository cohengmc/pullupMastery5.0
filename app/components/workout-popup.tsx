"use client"

import { useState, useEffect } from "react"

interface WorkoutPopupProps {
  workout: {
    type: string
    reps: string
    totalReps: number
  }
  position: { x: number; y: number }
  calendarRect: DOMRect | null
}

export function WorkoutPopup({ workout, position, calendarRect }: WorkoutPopupProps) {
  const [popupStyle, setPopupStyle] = useState({})

  useEffect(() => {
    const updatePosition = () => {
      const popupWidth = 200
      const popupHeight = 100
      const padding = 10

      let left = position.x + padding
      let top = position.y + padding

      // Adjust position if it would render off the right edge
      if (calendarRect && left + popupWidth > calendarRect.width) {
        left = position.x - popupWidth - padding
      }

      // Adjust position if it would render off the bottom edge
      if (calendarRect && top + popupHeight > calendarRect.height) {
        top = position.y - popupHeight - padding
      }

      setPopupStyle({
        left: `${left}px`,
        top: `${top}px`,
      })
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)

    return () => window.removeEventListener("resize", updatePosition)
  }, [position, calendarRect])

  return (
    <div className="absolute z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg" style={popupStyle}>
      <h3 className="text-sm font-semibold mb-1">{workout.type}:</h3>
      <p className="text-xs mb-1">Reps: {workout.reps}</p>
      <p className="text-xs">Total: {workout.totalReps}</p>
    </div>
  )
}

