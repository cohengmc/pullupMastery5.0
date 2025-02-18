"use client"

import { useTimer } from "../../hooks/use-timer"
import { ProgressCircle } from "../progress-circle"
import { SetProgress } from "../set-progress"
import { useState, useEffect, useCallback } from "react"
import NumberWheel from "../number-wheel"
import { cn } from "@/lib/utils"

const getLastNumericalRep = (reps: (number | "X")[]) => {
  for (let i = reps.length - 1; i >= 0; i--) {
    if (typeof reps[i] === "number") {
      return reps[i]
    }
  }
  return null
}

interface Day2TimerProps {
  onWorkoutComplete: (completedSets: (number | "X")[]) => void
}

export default function Day2Timer({ onWorkoutComplete }: Day2TimerProps) {
  const { timeLeft, progress, startTimer, stopTimer, isActive, setTimeLeft, setProgress } = useTimer(60)
  const [completedReps, setCompletedReps] = useState<(number | "X")[]>([])
  const [wheelValue, setWheelValue] = useState<number | "X">("X")
  const [wheelConfig, setWheelConfig] = useState({
    min: 1,
    max: 20,
  })
  const [isResting, setIsResting] = useState(false)
  const [currentSet, setCurrentSet] = useState(1)

  const updateWheelConfig = useCallback((completedReps: (number | "X")[]) => {
    const numericReps = completedReps.filter((rep): rep is number => typeof rep === "number")
    const minRep = numericReps.length > 0 ? Math.min(...numericReps) : 20
    setWheelConfig({
      min: 1,
      max: minRep,
    })
    setWheelValue("X")
  }, [])

  const addCompletedRep = useCallback(() => {
    setCompletedReps((prevReps) => {
      const newReps = [...prevReps, wheelValue]
      updateWheelConfig(newReps)
      return newReps
    })
    setCurrentSet((prevSet) => prevSet + 1)
  }, [wheelValue, updateWheelConfig])

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      stopTimer()
      setIsResting(false)
      addCompletedRep()
    }
  }, [timeLeft, isActive, stopTimer, addCompletedRep])

  useEffect(() => {
    if (completedReps.length === 10) {
      onWorkoutComplete(completedReps)
    }
  }, [completedReps, onWorkoutComplete])

  const handleSetComplete = () => {
    setTimeLeft(60)
    setProgress(100)
    startTimer()
    setIsResting(true)
  }

  const handleFastForward = () => {
    stopTimer()
    setTimeLeft(0)
    setProgress(0)
    setIsResting(false)
    addCompletedRep()
  }

  return (
    <div
      className={cn("h-screen w-full bg-background text-foreground flex items-center justify-center p-4 select-none")}
    >
      <div className="">
        <div className="bg-gray-900/50 rounded-3xl p-6">
          <div className="flex items-center justify-around">
            <div className="flex-1 mr-8">
              <div className="flex justify-start items-center gap-4 text-white text-sm mb-4">
                <div>Set {currentSet} of 10</div>
                <SetProgress
                  totalSets={10}
                  currentSet={currentSet}
                  completedSets={completedReps}
                  currentValue={wheelValue}
                />
              </div>
              <div className="flex justify-start gap-1 text-white text-sm mb-4">
                <div>Completed Reps: {completedReps.join(", ")}</div>
              </div>
              <div className="flex items-start justify-between gap-8">
                <div className="flex flex-col text-white mr-8">
                  {completedReps.length === 0 && !isResting ? (
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col text-4xl font-light tracking-wider leading-none pt-4">
                        <div>50%</div>
                        <div>Max</div>
                      </div>
                      <div className="text-6xl font-light tracking-wider">Reps</div>
                    </div>
                  ) : isResting ? (
                    <div className="text-4xl font-light tracking-wider text-primary">Rest</div>
                  ) : (
                    <div className="text-4xl font-light tracking-wider text-primary">
                      {(() => {
                        const lastNumericalRep = getLastNumericalRep(completedReps)
                        if (lastNumericalRep !== null) {
                          return (
                            <div className="flex flex-col items-start">
                              <div className="flex items-baseline gap-4">
                                <span className="text-6xl">{lastNumericalRep}</span>
                                <span className="text-6xl">Reps</span>
                              </div>
                              <div className="text-xl mt-2">or Form Breakdown</div>
                            </div>
                          )
                        } else if (completedReps.length > 0) {
                          return (
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col text-4xl font-light tracking-wider leading-none pt-4">
                                <div>50%</div>
                                <div>Max</div>
                              </div>
                              <div className="text-6xl font-light tracking-wider">Reps</div>
                            </div>
                          )
                        } else {
                          return "Ready to start"
                        }
                      })()}
                    </div>
                  )}
                </div>
                {isActive && timeLeft > 0 && (
                  <NumberWheel
                    min={wheelConfig.min}
                    max={wheelConfig.max}
                    value={wheelValue}
                    onChange={(value) => setWheelValue(value === null ? "X" : value)}
                    isFirstSet={completedReps.length === 0}
                  />
                )}
                <div className="relative w-40 h-40 mb-4">
                  <ProgressCircle progress={isActive ? progress : 0} seconds={isActive ? timeLeft.toString() : null} />
                </div>
              </div>
              <div className="mt-8 flex justify-start gap-1 text-white text-sm mb-4">
                <div>Next: {isActive ? `${wheelValue} ${wheelValue === 1 ? "Rep" : "Reps"}` : "Rest"}</div>
              </div>
              <div className="mt-8 flex space-x-4">
                <button
                  onClick={handleSetComplete}
                  className={`w-48 bg-cyan-700/30 text-cyan-400 rounded-full py-3 text-base font-medium hover:bg-cyan-700/40 transition-colors ${!isActive || timeLeft === 0 ? "" : "hidden"}`}
                >
                  Set Complete
                </button>
                {isActive && timeLeft > 0 && (
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
          </div>
        </div>
      </div>
    </div>
  )
}

