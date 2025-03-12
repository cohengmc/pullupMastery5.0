import { WorkoutSelection } from "@/components/workout-selection"

export default function Home() {
  return (
    <>
      <div className="bg-background text-foreground p-0 transition-colors h-full w-full flex flex-col">
        <div className="flex-1 w-full flex items-center justify-center">
          <div id="get-started" className="w-full">
            <WorkoutSelection className="bg-card/30" />
          </div>
        </div>
      </div>
    </>
  )
}
