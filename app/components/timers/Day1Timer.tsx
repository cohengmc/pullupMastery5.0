"use client";

import { useTimer } from "../../hooks/use-timer";
import { ProgressCircle } from "../progress-circle";
import { SetProgress } from "../set-progress";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import NumberWheel from "../number-wheel";
import { HomeButton } from "../home-button";
import { EmailButton } from "../email-button";

interface Day1TimerProps {
  onWorkoutComplete: (completedSets: (number | "X")[]) => void;
}

export default function Day1Timer({ onWorkoutComplete }: Day1TimerProps) {
  const {
    timeLeft,
    progress,
    startTimer,
    stopTimer,
    isActive,
    setTimeLeft,
    setProgress,
  } = useTimer(300); // 5 minutes in seconds
  const [completedReps, setCompletedReps] = useState<(number | "X")[]>([]);
  const [wheelValue, setWheelValue] = useState<number | "X">("X");
  const [wheelConfig, setWheelConfig] = useState({
    min: 1,
    max: 50,
  });
  const [isResting, setIsResting] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [showNumberWheel, setShowNumberWheel] = useState(false);
  const [completedSetCount, setCompletedSetCount] = useState(0);

  useEffect(() => {
    setCompletedSetCount(completedReps.length);
  }, [completedReps]);

  const formatTime = (seconds: number): string => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    return seconds.toString();
  };

  const updateWheelConfig = useCallback((completedReps: (number | "X")[]) => {
    const numericReps = completedReps.filter(
      (rep): rep is number => typeof rep === "number"
    );
    if (numericReps.length > 0) {
      const minRep = Math.min(...numericReps);
      setWheelConfig({
        min: 1,
        max: minRep,
      });
    } else {
      setWheelConfig({
        min: 1,
        max: 50,
      });
    }
    setWheelValue("X");
  }, []);

  useEffect(() => {
    updateWheelConfig(completedReps);
  }, [completedReps, updateWheelConfig]);

  const completeSet = useCallback(() => {
    setCompletedReps((prevReps) => {
      const newReps = [...prevReps, wheelValue];
      if (currentSet === 3) {
        onWorkoutComplete(newReps);
      }
      return newReps;
    });
    if (currentSet < 3) {
      setCurrentSet((prevSet) => prevSet + 1);
    }
  }, [currentSet, wheelValue, onWorkoutComplete]);

  useEffect(() => {
    if (timeLeft === 0) {
      stopTimer();
      setIsResting(false);
      setShowNumberWheel(false);
      completeSet();
    }
  }, [timeLeft, stopTimer, completeSet]);

  const handleSetComplete = () => {
    setTimeLeft(300);
    setProgress(100);
    startTimer();
    setIsResting(true);
    setShowNumberWheel(true);
  };

  const handleFastForward = () => {
    stopTimer();
    setTimeLeft(0);
    setProgress(0);
    setIsResting(false);
    setShowNumberWheel(false);
    completeSet();
  };

  useEffect(() => {
    if (isActive && isResting) {
      setWheelValue("X");
    }
  }, [isActive, isResting]);

  return (
    <div
      className={cn(
        "flex-1 w-full h-full bg-background text-foreground flex flex-col overflow-hidden select-none p-6"
      )}
    >
      {/* Header Section */}
      <div className="flex-none">
        <div className="flex justify-center landscape:justify-start gap-2 items-end text-sm mb-4">
          <div className="text-xl sm:text-1xl font-light tracking-wider mb-2">
            Set {currentSet}
          </div>
          <SetProgress
            totalSets={3}
            currentSet={currentSet}
            completedSets={completedReps}
            currentValue={isResting && showNumberWheel ? wheelValue : undefined}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <div className="">
            <div className="flex flex-col landscape:flex-row items-center justify-between">
              <div className="flex-1 landscape:mr-6 w-full">
                <div className="flex items-center justify-around">
                  <div className="flex-col items-center justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {isResting ? (
                          <div className="text-6xl font-light tracking-wider text-primary">
                            Rest
                          </div>
                        ) : (
                          <div className="text-6xl font-light tracking-wider text-primary">
                            <div>Max</div>
                            <div>Reps</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-8 flex justify-center gap-1 text-sm mb-4">
                      <div>
                        {isResting ? "Next: Max Reps" : "Next: 5 Minute Rest"}
                      </div>
                    </div>
                    {/* <div className="mt-8 flex space-x-4">
                      {isActive && (
                        <button
                          onClick={handleFastForward}
                          className="w-12 h-12 bg-red-500/30 text-red-400 rounded-full text-xs font-medium hover:bg-red-500/40 transition-colors ml-2"
                          aria-label="Fast Forward"
                        >
                          FF
                        </button>
                      )}
                    </div> */}
                  </div>
                  <div>
                    {!isResting && (
                      <button
                        onClick={handleSetComplete}
                        className="bg-primary/30 text-primary rounded-full px-6 py-3 text-base font-medium hover:bg-primary/40 transition-colors border-primary border-2"
                      >
                        Set Complete
                      </button>
                    )}
                    {isResting && showNumberWheel && (
                      <NumberWheel
                        min={wheelConfig.min}
                        max={wheelConfig.max}
                        value={wheelValue}
                        onChange={(value) =>
                          setWheelValue(value === null ? "X" : value)
                        }
                        completedReps={completedReps}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="relative mt-6 landscape:mt-0 landscape:w-60 landscape:h-60">
                <ProgressCircle
                  progress={isActive ? progress : 0}
                  seconds={isActive ? formatTime(timeLeft) : null}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
