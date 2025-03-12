"use client";

import { useTimer } from "../../hooks/use-timer";
import { ProgressCircle } from "../progress-circle";
import { SetProgress } from "../set-progress";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { HomeButton } from "../home-button";

interface TimerAppProps {
  workoutType: "max-day" | "sub-max-volume" | "ladder-volume";
  onWorkoutComplete: (completedSets: number[]) => void;
}

export default function TimerApp({
  workoutType,
  onWorkoutComplete,
}: TimerAppProps) {
  const router = useRouter();
  const {
    timeLeft,
    progress,
    startTimer,
    stopTimer,
    isActive,
    setTimeLeft,
    setProgress,
  } = useTimer(30);
  const [repsComplete, setRepsComplete] = useState(0);
  const [isRepButtonVisible, setIsRepButtonVisible] = useState(true);
  const [setsComplete, setSetsComplete] = useState(0);
  const [completedRepsSets, setCompletedRepsSets] = useState<number[]>([]);
  const [isSetCompleted, setIsSetCompleted] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsRepButtonVisible(true);
      setIsSetCompleted(false);
    }
  }, [timeLeft]);

  const getMaxSets = () => {
    return 5;
  };

  const handleWorkoutComplete = () => {
    onWorkoutComplete(completedRepsSets);
  };

  useEffect(() => {
    if (setsComplete === getMaxSets()) {
      handleWorkoutComplete();
    }
  }, [setsComplete, handleWorkoutComplete]);

  return (
    <div
      className={cn(
        "w-full h-screen bg-background text-foreground flex flex-col overflow-hidden select-none p-6"
      )}
    >
      {/* Header Section */}
      <div className="flex-none">
        <div className="flex justify-start gap-2 items-end text-white text-sm mb-4">
          <div className="text-xl sm:text-1xl md:text-3xl font-light tracking-wider mb-2 text-white">
            Set {currentSet}
          </div>
          <SetProgress
            totalSets={5}
            currentSet={currentSet}
            completedSets={completedRepsSets}
            currentValue={repsComplete}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <div className="bg-gray-900/50 rounded-3xl">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-8">
                <div className="flex items-center justify-between">
                  <div className="flex-col items-center justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col text-white">
                        {isActive ? (
                          <div className="text-6xl font-light tracking-wider text-primary">
                            Rest
                          </div>
                        ) : (
                          <div className="text-6xl font-light tracking-wider text-primary">
                            <div>{repsComplete + 1}</div>
                            <div>{repsComplete === 0 ? "Rep" : "Reps"}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-8 flex justify-start gap-1 text-white text-sm mb-4">
                      <div>
                        Next:{" "}
                        {isActive
                          ? `${repsComplete + 1} ${repsComplete === 0 ? "Rep" : "Reps"}`
                          : "Rest"}
                      </div>
                    </div>
                    <div className="mt-8 flex space-x-4">
                      {isActive && (
                        <button
                          onClick={() => {
                            stopTimer();
                            setTimeLeft(0);
                            setProgress(0);
                          }}
                          className="w-12 h-12 bg-red-500/30 text-red-400 rounded-full text-xs font-medium hover:bg-red-500/40 transition-colors ml-2"
                          aria-label="Fast Forward"
                        >
                          FF
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    {isRepButtonVisible && !isActive && (
                      <button
                        onClick={() => {
                          stopTimer();
                          startTimer();
                          setRepsComplete((prevReps) => prevReps + 1);
                          setIsRepButtonVisible(false);
                        }}
                        className="w-48 bg-primary/30 text-primary rounded-full py-3 text-base font-medium hover:bg-primary/40 transition-colors"
                      >
                        Rep Complete
                      </button>
                    )}
                    {(repsComplete > 0 || setsComplete > 0) && isActive && (
                      <button
                        onClick={() => {
                          if (!isSetCompleted) {
                            setSetsComplete((prevSets) => prevSets + 1);
                            setCompletedRepsSets((prevSets) => [...prevSets, repsComplete]);
                            setRepsComplete(0);
                            setIsSetCompleted(true);
                            startTimer();
                            setCurrentSet((prevSet) => prevSet + 1);
                          } else {
                            setSetsComplete((prevSets) => prevSets - 1);
                            setCompletedRepsSets((prevSets) => prevSets.slice(0, -1));
                            setRepsComplete(completedRepsSets[completedRepsSets.length - 1]);
                            setIsSetCompleted(false);
                            setCurrentSet((prevSet) => prevSet - 1);
                          }
                        }}
                        className={`w-48 rounded-full py-3 text-base font-medium transition-colors ${
                          isSetCompleted
                            ? "bg-destructive/30 text-destructive hover:bg-destructive/40"
                            : "bg-primary/30 text-primary hover:bg-primary/40"
                        }`}
                      >
                        {isSetCompleted ? "Undo Set Complete" : "Set Complete"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative w-60 h-60">
                <ProgressCircle
                  progress={progress}
                  seconds={timeLeft > 0 ? timeLeft.toString() : null}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Home Button */}
      <HomeButton />
    </div>
  );
}
