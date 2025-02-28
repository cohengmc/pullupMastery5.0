import { createClient } from "@/utils/supabase/server"
import { LandingHero } from "@/components/landing-hero"
import { WorkoutSelection } from "@/components/workout-selection"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is logged in, redirect to protected page
  if (user) {
    return redirect("/protected")
  }

  return (
    <>
      {/* Hero Section */}
      <LandingHero />

      {/* Additional Sections */}
      <div className="bg-background text-foreground p-2 sm:p-4 md:p-8 lg:p-12 transition-colors">
        <div className="max-w-5xl mx-auto space-y-12">
          <div id="how-it-works" className="scroll-mt-16">
            <h2 className="text-3xl font-semibold mb-8">How It Works</h2>
            <WorkoutSelection className="bg-card/30" />
          </div>
        </div>
      </div>
    </>
  )
}
