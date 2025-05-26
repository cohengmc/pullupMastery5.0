'use client'

import { useState, useEffect, useCallback } from 'react'

export function useTimer(initialSeconds: number = 60) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(initialSeconds)
  const [progress, setProgress] = useState(100)
  const [startTime, setStartTime] = useState<number | null>(null)

  const startTimer = useCallback(() => {
    setIsActive(true)
    setStartTime(Date.now())
  }, [])

  const pauseTimer = useCallback(() => {
    setIsActive(false)
    setStartTime(null)
  }, [])

  const stopTimer = useCallback(() => {
    setIsActive(false)
    setTimeLeft(selectedPreset)
    setProgress(100)
    setStartTime(null)
  }, [selectedPreset])

  const setPresetTime = useCallback((seconds: number) => {
    setSelectedPreset(seconds)
    setTimeLeft(seconds)
    setProgress(100)
    setIsActive(false)
    setStartTime(null)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        if (startTime) {
          const elapsedSeconds = (Date.now() - startTime) / 1000
          const newTime = Math.max(0, selectedPreset - elapsedSeconds)
          setTimeLeft(newTime)
          setProgress((newTime / selectedPreset) * 100)
          
          if (newTime === 0) {
            setIsActive(false)
          }
        }
      }, 100)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isActive, selectedPreset, startTime])

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

