"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WorkoutForm } from "./workout-form";
import { PenSquare, PlusIcon } from "lucide-react";

export function WorkoutFormWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleWorkoutChange = () => {
    // This will be used to refresh the workout data in the parent components
    // You might want to implement a more sophisticated state management solution
    window.location.reload();
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="icon" variant="ghost">
        <PenSquare className="h-6 w-6" />
      </Button>
      {isOpen && (
        <WorkoutForm
          date={new Date()}
          formType="add"
          onClose={handleClose}
          onWorkoutChange={handleWorkoutChange}
        />
      )}
    </>
  );
}
