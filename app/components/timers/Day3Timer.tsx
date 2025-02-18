"use client"

import { useTimer } from "../../hooks/use-timer"
import { ProgressCircle } from "../progress-circle"
import { SetProgress } from "../set-progress"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface TimerAppProps {
  workoutType: "max-day" | "sub-max-volume" | "ladder-volume"
  onWorkoutComplete: (completedSets: number[]) => void
}

export default function TimerApp({ workoutType, onWorkoutComplete }: TimerAppProps) {
  const router = useRouter()
  const { timeLeft, progress, startTimer, stopTimer, isActive, setTimeLeft, setProgress } = useTimer(30)
  const [repsComplete, setRepsComplete] = useState(0)
  const [isRepButtonVisible, setIsRepButtonVisible] = useState(true)
  const [setsComplete, setSetsComplete] = useState(0)
  const [completedRepsSets, setCompletedRepsSets] = useState<number[]>([])
  const [isSetCompleted, setIsSetCompleted] = useState(false)
  const [currentSet, setCurrentSet] = useState(1)

  useEffect(() => {
    if (timeLeft === 0) {
      setIsRepButtonVisible(true)
      setIsSetCompleted(false)
    }
  }, [timeLeft])

  const getMaxSets = () => {
    return 5
  }

  const handleWorkoutComplete = () => {
    onWorkoutComplete(completedRepsSets)
  }

  useEffect(() => {
    if (setsComplete === getMaxSets()) {
      handleWorkoutComplete()
    }
  }, [setsComplete, handleWorkoutComplete]) // Added handleWorkoutComplete to dependencies

  return (
    <div
      className={cn("h-screen w-full bg-background text-foreground flex items-center justify-center p-4 select-none")}
    >
      <div className="w-full max-w-xl">
        <div className="bg-gray-900/50 rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div>
              <div className="flex justify-start items-center gap-4 text-white text-sm mb-4">
                <div>Set {currentSet} of 5</div>
                <SetProgress
                  totalSets={5}
                  currentSet={currentSet}
                  completedSets={completedRepsSets}
                  currentValue={repsComplete}
                />
              </div>
              <div className="text-5xl font-light tracking-wider text-primary">
                {isActive ? (
                  "Rest"
                ) : (
                  <>
                    {repsComplete + 1} {repsComplete === 0 ? "Rep" : "Reps"}
                  </>
                )}
              </div>
              <div className="mt-8 flex justify-start gap-1 text-gray-400 text-sm mb-4">
                <div>Next: {isActive ? `${repsComplete + 1} ${repsComplete === 0 ? "Rep" : "Reps"}` : "Rest"}</div>
              </div>
              <div className="mt-8 flex space-x-4">
                <button
                  onClick={() => {
                    stopTimer()
                    startTimer()
                    setRepsComplete((prevReps) => prevReps + 1)
                    setIsRepButtonVisible(false)
                  }}
                  className={`w-48 bg-cyan-700/30 text-cyan-400 rounded-full py-3 text-base font-medium hover:bg-cyan-700/40 transition-colors ${isRepButtonVisible ? "" : "hidden"}`}
                >
                  Rep Complete
                </button>
                {(repsComplete > 0 || setsComplete > 0) && isActive && (
                  <button
                    onClick={() => {
                      if (!isSetCompleted) {
                        setSetsComplete((prevSets) => prevSets + 1)
                        setCompletedRepsSets((prevSets) => [...prevSets, repsComplete])
                        setRepsComplete(0)
                        setIsSetCompleted(true)
                        startTimer()
                        setCurrentSet((prevSet) => prevSet + 1)
                      } else {
                        setSetsComplete((prevSets) => prevSets - 1)
                        setCompletedRepsSets((prevSets) => prevSets.slice(0, -1))
                        setRepsComplete(completedRepsSets[completedRepsSets.length - 1])
                        setIsSetCompleted(false)
                        setCurrentSet((prevSet) => prevSet - 1)
                      }
                    }}
                    className={`w-48 rounded-full py-3 text-base font-medium transition-colors ${
                      isSetCompleted
                        ? "bg-red-700/30 text-red-400 hover:bg-red-700/40"
                        : "bg-cyan-700/30 text-cyan-400 hover:bg-cyan-700/40"
                    }`}
                  >
                    {isSetCompleted ? "Undo Set Complete" : "Set Complete"}
                  </button>
                )}
                {isActive && (
                  <button
                    onClick={() => {
                      stopTimer()
                      setTimeLeft(0)
                      setProgress(0)
                    }}
                    className="w-12 h-12 bg-red-500/30 text-red-400 rounded-full text-xs font-medium hover:bg-red-500/40 transition-colors ml-2"
                  >
                    FF
                  </button>
                )}
              </div>
            </div>
            <div className="relative w-40 h-40">
              <ProgressCircle progress={progress} seconds={timeLeft > 0 ? timeLeft.toString() : null} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

