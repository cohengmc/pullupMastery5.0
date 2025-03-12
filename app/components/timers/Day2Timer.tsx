"use client";

import { useTimer } from "../../hooks/use-timer";
import { ProgressCircle } from "../progress-circle";
import { SetProgress } from "../set-progress";
import { useState, useEffect, useCallback } from "react";
import NumberWheel from "../number-wheel";
import { cn } from "@/lib/utils";
import { HomeButton } from "../home-button";

const getLastNumericalRep = (reps: (number | "X")[]) => {
  for (let i = reps.length - 1; i >= 0; i--) {
    if (typeof reps[i] === "number") {
      return reps[i];
    }
  }
  return null;
};

interface Day2TimerProps {
  onWorkoutComplete: (completedSets: (number | "X")[]) => void;
}

export default function Day2Timer({ onWorkoutComplete }: Day2TimerProps) {
  const {
    timeLeft,
    progress,
    startTimer,
    stopTimer,
    isActive,
    setTimeLeft,
    setProgress,
  } = useTimer(60);
  const [completedReps, setCompletedReps] = useState<(number | "X")[]>([]);
  const [wheelValue, setWheelValue] = useState<number | "X">("X");
  const [wheelConfig, setWheelConfig] = useState({
    min: 1,
    max: 20,
  });
  const [isResting, setIsResting] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);

  const updateWheelConfig = useCallback((completedReps: (number | "X")[]) => {
    const numericReps = completedReps.filter(
      (rep): rep is number => typeof rep === "number"
    );
    const minRep = numericReps.length > 0 ? Math.min(...numericReps) : 20;
    setWheelConfig({
      min: 1,
      max: minRep,
    });
    setWheelValue("X");
  }, []);

  const addCompletedRep = useCallback(() => {
    setCompletedReps((prevReps) => {
      const newReps = [...prevReps, wheelValue];
      updateWheelConfig(newReps);
      return newReps;
    });
    setCurrentSet((prevSet) => prevSet + 1);
  }, [wheelValue, updateWheelConfig]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      stopTimer();
      setIsResting(false);
      addCompletedRep();
    }
  }, [timeLeft, isActive, stopTimer, addCompletedRep]);

  useEffect(() => {
    if (completedReps.length === 10) {
      onWorkoutComplete(completedReps);
    }
  }, [completedReps, onWorkoutComplete]);

  const handleSetComplete = () => {
    setTimeLeft(60);
    setProgress(100);
    startTimer();
    setIsResting(true);
  };

  const handleFastForward = () => {
    stopTimer();
    setTimeLeft(0);
    setProgress(0);
    setIsResting(false);
    addCompletedRep();
  };

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
            totalSets={10}
            currentSet={currentSet}
            completedSets={completedReps}
            currentValue={isResting ? wheelValue : undefined}
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
                        {completedReps.length === 0 && !isResting ? (
                          <div className="text-6xl font-light tracking-wider text-primary">
                            <div>50%</div>
                            <div>Max</div>
                            <div>Reps</div>
                          </div>
                        ) : isResting ? (
                          <div className="text-6xl font-light tracking-wider text-primary">
                            Rest
                          </div>
                        ) : (
                          <div className="text-6xl font-light tracking-wider text-primary">
                            {(() => {
                              const lastNumericalRep = getLastNumericalRep(completedReps);
                              if (lastNumericalRep !== null) {
                                return (
                                  <>
                                    <div>{lastNumericalRep}</div>
                                    <div>Reps</div>
                                  </>
                                );
                              }
                              return (
                                <>
                                  <div>50%</div>
                                  <div>Max</div>
                                  <div>Reps</div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-8 flex justify-start gap-1 text-white text-sm mb-4">
                      <div>
                        {isResting ? "Next: Max Reps" : "Next: 1 Minute Rest"}
                      </div>
                    </div>
                    <div className="mt-8 flex space-x-4">
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
                    {!isResting && (
                      <button
                        onClick={handleSetComplete}
                        className="w-48 bg-primary/30 text-primary rounded-full py-3 text-base font-medium hover:bg-primary/40 transition-colors"
                      >
                        Set Complete
                      </button>
                    )}
                    {isResting && (
                      <NumberWheel
                        min={wheelConfig.min}
                        max={wheelConfig.max}
                        value={wheelValue}
                        onChange={(value) => setWheelValue(value === null ? "X" : value)}
                        completedReps={completedReps}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="relative w-60 h-60">
                <ProgressCircle
                  progress={isActive ? progress : 0}
                  seconds={isActive ? timeLeft.toString() : null}
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
