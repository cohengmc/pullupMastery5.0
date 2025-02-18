'use client'

import { useState, useEffect, useCallback } from 'react'

export function useTimer(initialSeconds: number = 60) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(initialSeconds)
  const [progress, setProgress] = useState(100)

  const startTimer = useCallback(() => {
    setIsActive(true)
  }, [])

  const pauseTimer = useCallback(() => {
    setIsActive(false)
  }, [])

  const stopTimer = useCallback(() => {
    setIsActive(false)
    setTimeLeft(selectedPreset)
    setProgress(100)
  }, [selectedPreset])

  const setPresetTime = useCallback((seconds: number) => {
    setSelectedPreset(seconds)
    setTimeLeft(seconds)
    setProgress(100)
    setIsActive(false)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 0.1
          setProgress((newTime / selectedPreset) * 100)
          return newTime > 0 ? newTime : 0
        })
      }, 100)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isActive, timeLeft, selectedPreset])

  return {
    timeLeft: Math.ceil(timeLeft),
    isActive,
    progress,
    startTimer,
    pauseTimer,
    stopTimer,
    setPresetTime,
    selectedPreset,
    setTimeLeft,
    setProgress
  }
}

