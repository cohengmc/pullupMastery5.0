import { useEffect, useRef } from 'react'

interface ProgressCircleProps {
  progress: number
  seconds: string | null
}

export function ProgressCircle({ progress, seconds }: ProgressCircleProps) {
  const circumference = 2 * Math.PI * 67.5
  const progressRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (progressRef.current) {
      const strokeDashoffset = circumference - (progress / 100) * circumference
      progressRef.current.style.strokeDashoffset = strokeDashoffset.toString()
    }
  }, [progress, circumference])

  return (
    <>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 150 150" preserveAspectRatio="xMidYMid meet">
        <circle
          className="stroke-current text-gray-700"
          strokeWidth="14"
          fill="none"
          r="67.5"
          cx="75"
          cy="75"
        />
        <circle
          ref={progressRef}
          className="stroke-current text-cyan-400 transition-all duration-100 ease-linear"
          strokeWidth="16"
          fill="none"
          r="67.5"
          cx="75"
          cy="75"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {seconds !== null && seconds !== "0" && (
          <div className="text-5xl font-light tracking-wider text-white tabular-nums">
            {seconds}
          </div>
        )}
      </div>
    </>
  )
}

