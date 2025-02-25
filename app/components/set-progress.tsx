import { Check, ArrowDown, X } from 'lucide-react'
import { cn } from "@/lib/utils"

interface SetProgressProps {
  totalSets: number
  currentSet: number
  completedSets: number[]
  currentValue?: number | 'X'
}

export function SetProgress({ totalSets, currentSet, completedSets, currentValue }: SetProgressProps) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: totalSets }).map((_, index) => {
        const isComplete = index < completedSets.length
        const isCurrent = !isComplete && index === currentSet - 1
        
        return (
          <div
            key={index}
            className={cn(
              "w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-colors",
              isComplete && "bg-green-950/30 border-green-500",
              isCurrent && "bg-primary/20 border-primary",
              !isComplete && !isCurrent && "bg-destructive/20 border-destructive"
            )}
          >
            {isComplete ? (
              <Check className="w-6 h-6 text-green-500" />
            ) : isCurrent ? (
              currentValue && currentValue !== 'X' ? (
                <span className="text-primary font-mono text-lg">
                  {currentValue.toString().padStart(2, '0')}
                </span>
              ) : (
                <ArrowDown className="w-6 h-6 text-primary" />
              )
            ) : (
              <div className="w-6 h-6 text-destructive flex justify-center align-center font-black">
                -
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

