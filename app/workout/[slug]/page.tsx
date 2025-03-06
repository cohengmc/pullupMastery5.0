'use client'

import { useRouter } from 'next/navigation'
import { use, useCallback } from 'react'
import Day1Timer from '../../components/timers/Day1Timer'
import Day2Timer from '../../components/timers/Day2Timer'
import Day3Timer from '../../components/timers/Day3Timer'

type PageParams = {
  params: Promise<{ slug: string }>
}

export default function WorkoutPage({ params }: PageParams) {
  const router = useRouter()
  const { slug } = use(params)

  const handleWorkoutComplete = useCallback((completedSets: (number | "X")[]) => {
    // First save to localStorage
    localStorage.setItem(`workout_${slug}`, JSON.stringify({ reps: completedSets }))
    
    // Use setTimeout to ensure the state update happens in the next tick
    setTimeout(() => {
      router.push(`/summary/${slug}`)
    }, 0)
  }, [router, slug])

  return (
    <div className="w-full overflow-hidden">
      {slug === 'max-day' && (
        <Day1Timer onWorkoutComplete={handleWorkoutComplete} />
      )}
      {slug === 'sub-max-volume' && (
        <Day2Timer onWorkoutComplete={handleWorkoutComplete} />
      )}
      {slug === 'ladder-volume' && (
        <Day3Timer workoutType="ladder-volume" onWorkoutComplete={handleWorkoutComplete} />
      )}
    </div>
  )
}

