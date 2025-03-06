"use client"

import { useTimer } from "../../hooks/use-timer"
import { ProgressCircle } from "../progress-circle"
import { SetProgress } from "../set-progress"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import NumberWheel from "../number-wheel"

interface Day1TimerProps {
  onWorkoutComplete: (completedSets: (number | "X")[]) => void
}

export default function Day1Timer({ onWorkoutComplete }: Day1TimerProps) {
  const { timeLeft, progress, startTimer, stopTimer, isActive, setTimeLeft, setProgress } = useTimer(300) // 5 minutes in seconds
  const [completedReps, setCompletedReps] = useState<(number | "X")[]>([])
  const [wheelValue, setWheelValue] = useState<number | "X">("X")
  const [wheelConfig, setWheelConfig] = useState({
    min: 1,
    max: 50,
  })
  const [isResting, setIsResting] = useState(false)
  const [currentSet, setCurrentSet] = useState(1)
  const [showNumberWheel, setShowNumberWheel] = useState(false)
  const [completedSetCount, setCompletedSetCount] = useState(0)

  useEffect(() => {
    setCompletedSetCount(completedReps.length)
  }, [completedReps])

  const formatTime = (seconds: number): string => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
    }
    return seconds.toString()
  }

  const updateWheelConfig = useCallback((completedReps: (number | "X")[]) => {
    const numericReps = completedReps.filter((rep): rep is number => typeof rep === "number")
    if (numericReps.length > 0) {
      const minRep = Math.min(...numericReps)
      setWheelConfig({
        min: 1,
        max: minRep,
      })
    } else {
      setWheelConfig({
        min: 1,
        max: 50,
      })
    }
    setWheelValue("X")
  }, [])

  useEffect(() => {
    updateWheelConfig(completedReps)
  }, [completedReps, updateWheelConfig])

  const completeSet = useCallback(() => {
    setCompletedReps((prevReps) => {
      const newReps = [...prevReps, wheelValue]
      if (currentSet === 3) {
        onWorkoutComplete(newReps)
      }
      return newReps
    })
    if (currentSet < 3) {
      setCurrentSet((prevSet) => prevSet + 1)
    }
  }, [currentSet, wheelValue, onWorkoutComplete])

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      stopTimer()
      setIsResting(false)
      setShowNumberWheel(false)
      completeSet()
    }
  }, [timeLeft, isActive, stopTimer, completeSet])

  const handleSetComplete = () => {
    setTimeLeft(300)
    setProgress(100)
    startTimer()
    setIsResting(true)
    setShowNumberWheel(true)
  }

  const handleFastForward = () => {
    stopTimer()
    setTimeLeft(0)
    setProgress(0)
    setIsResting(false)
    setShowNumberWheel(false)
    completeSet()
  }

  useEffect(() => {
    if (isActive && isResting) {
      setWheelValue("X")
    }
  }, [isActive, isResting])

  return (
    <div
      className={cn("w-full bg-background text-foreground flex items-center justify-center p-4 select-none")}
    >
      <div className="w-full max-w-xl">
        <div className="bg-gray-900/50 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-8">
              <div className="flex justify-start items-center gap-1 text-white text-sm mb-4">
                <div>Set {currentSet} of 3</div>
                <SetProgress
                  totalSets={3}
                  currentSet={currentSet}
                  completedSets={completedReps}
                  currentValue={isResting && showNumberWheel ? wheelValue : undefined}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-col items-center justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col text-white mr-8">
                      {isResting ? (
                        <div className="text-4xl font-light tracking-wider text-primary">Rest</div>
                      ) : (
                        <div className="text-6xl font-light tracking-wider text-primary">
                          <div>Max</div>
                          <div>Reps</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-8 flex justify-start gap-1 text-white text-sm mb-4">
                    <div>{isResting ? "Next: Max Reps" : "Next: 5 Minute Rest"}</div>
                  </div>
                  <div className="mt-8 flex space-x-4">
                    {!isResting && (
                      <button
                        onClick={handleSetComplete}
                        className="w-48 bg-primary/30 text-primary rounded-full py-3 text-base font-medium hover:bg-primary/40 transition-colors"
                      >
                        Set Complete
                      </button>
                    )}
                    {isActive && (
                      <button
                        onClick={handleFastForward}
                        className="w-12 h-12 bg-red-500/30 text-red-400 rounded-full text-xs font-medium hover:bg-red-500/40 transition-colors ml-2"
                        aria-label="Fast Forward"
                      >
                        FF
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  {isResting && showNumberWheel && (
                    <NumberWheel
                      min={wheelConfig.min}
                      max={wheelConfig.max}
                      value={wheelValue}
                      onChange={(value) => setWheelValue(value === null ? "X" : value)}
                      isFirstSet={completedReps.length === 0}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="relative w-60 h-60">
              <ProgressCircle progress={isActive ? progress : 0} seconds={isActive ? formatTime(timeLeft) : null} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

