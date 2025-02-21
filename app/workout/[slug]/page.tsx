'use client'

import { useRouter } from 'next/navigation'
import Day1Timer from '../../components/timers/Day1Timer'
import Day2Timer from '../../components/timers/Day2Timer'
import Day3Timer from '../../components/timers/Day3Timer'

export default function WorkoutPage({ params }: { params: { slug: string } }) {
  const router = useRouter()

  const handleWorkoutComplete = (completedSets: (number | "X")[]) => {
    localStorage.setItem(`workout_${params.slug}`, JSON.stringify({ reps: completedSets }))
    router.push(`/summary/${params.slug}`)
  }

  return (
    <div className="w-full overflow-hidden">
      {params.slug === 'max-day' && (
        <Day1Timer onWorkoutComplete={handleWorkoutComplete} />
      )}
      {params.slug === 'sub-max-volume' && (
        <Day2Timer onWorkoutComplete={handleWorkoutComplete} />
      )}
      {params.slug === 'ladder-volume' && (
        <Day3Timer workoutType="ladder-volume" onWorkoutComplete={handleWorkoutComplete} />
      )}
    </div>
  )
}

