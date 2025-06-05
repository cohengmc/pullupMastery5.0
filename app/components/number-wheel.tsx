"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from "@/lib/utils"

interface NumberWheelProps {
  min: number
  max: number
  value: number | 'X'
  onChange?: (value: number | null) => void
  completedReps: (number | 'X')[]
}

export default function NumberWheel({ 
  min, 
  max, 
  value,
  onChange,
  completedReps
}: NumberWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const lastYRef = useRef(0)

  const shouldShowXFirst = completedReps.length === 0 || !completedReps.some(rep => typeof rep === 'number')

  const getDisplayNumbers = useCallback(() => {
    const numbers = Array.from({length: max - min + 1}, (_, i) => String(min + i).padStart(2, '0'))
    return shouldShowXFirst ? ['X', ...numbers] : [...numbers, 'X']
  }, [min, max, shouldShowXFirst])

  const updateValue = useCallback((delta: number) => {
    const numbers = getDisplayNumbers()
    const currentIndex = numbers.indexOf(value === 'X' ? 'X' : String(value).padStart(2, '0'))
    const newIndex = Math.max(0, Math.min(numbers.length - 1, currentIndex + delta))
    const newValue = numbers[newIndex]
    onChange?.(newValue === 'X' ? null : parseInt(newValue, 10))
  }, [value, getDisplayNumbers, onChange, min, max])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = -Math.sign(e.deltaY)
    const sensitivity = 0.2 // Adjust this value to change scroll sensitivity
    if (Math.random() < sensitivity) {
      updateValue(delta)
    }
  }, [updateValue])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDraggingRef.current = true
    lastYRef.current = e.clientY
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return
    const delta = Math.round((e.clientY - lastYRef.current) / 30)
    if (delta !== 0) {
      updateValue(delta)
      lastYRef.current = e.clientY
    }
  }, [updateValue])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDraggingRef.current = true;
    lastYRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    const delta = Math.round((e.touches[0].clientY - lastYRef.current) / 30);
    if (delta !== 0) {
      updateValue(delta);
      lastYRef.current = e.touches[0].clientY;
    }
  }, [updateValue]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateValue(1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        updateValue(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [updateValue]);

  const numbers = getDisplayNumbers()
  const selectedIndex = numbers.indexOf(value === 'X' ? 'X' : String(value).padStart(2, '0'))

  return (
    <div 
      ref={wheelRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={cn(
        "relative h-[200px] w-[120px] overflow-hidden bg-background rounded-lg select-none cursor-grab active:cursor-grabbing border-2",
        value === 'X' ? "border-destructive" : "border-green-500"
      )}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value === 'X' ? undefined : value}
      tabIndex={0}
    >
      <div 
        className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center transition-transform duration-200 w-full"
        style={{
          perspective: '1000px',
          perspectiveOrigin: 'center'
        }}
      >
        {numbers.map((number, index) => {
          const offset = selectedIndex - index
          const absOffset = Math.abs(offset)
          
          const scale = Math.max(0.5, 1 - absOffset * 0.15)
          const opacity = Math.max(0.2, 1 - absOffset * 0.25)
          const scaleY = Math.max(0.5, 1 - absOffset * 0.1)
          
          return (
            <div
              key={number}
              className={cn(
                "absolute h-[40px] w-full flex items-center justify-center font-mono text-2xl transition-all duration-200 pointer-events-none",
                number === (value === 'X' ? 'X' : String(value).padStart(2, '0'))
                  ? "text-foreground z-10" 
                  : "text-foreground/50"
              )}
              style={{
                transform: `
                  translateY(${offset * 40}px)
                  scale(${scale})
                  scaleY(${scaleY})
                  translateZ(${-Math.abs(offset) * 20}px)
                `,
                opacity: Math.abs(offset) <= 4 ? opacity : 0
              }}
            >
              {number.toString()}
            </div>
          )
        })}
      </div>
      <div className="absolute top-1/2 left-0 right-0 h-[40px] -translate-y-1/2 border-y border-foreground/50 pointer-events-none" />
    </div>
  )
}

