import { useState } from "react";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function HomeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        className={`absolute right-3 bottom-3 center p-3 rounded-full transition-colors ${
          isHovered ? "bg-destructive/30" : "bg-primary/30"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(true)}
      >
        <Home
          className={`w-6 h-6 ${
            isHovered ? "text-destructive" : "text-primary"
          }`}
        />
      </button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-[300px] p-4 gap-2">
          <AlertDialogHeader className="space-y-1 flex items-center">
            <AlertDialogTitle className="text-base">Exit workout?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
            <AlertDialogCancel
              className="h-8 px-3 text-sm bg-primary/30 text-primary hover:bg-primary/40 flex-1"
            >
              Keep Going
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-8 px-3 text-sm bg-destructive/30 text-destructive hover:bg-destructive/40 flex-1"
              onClick={() => {
                router.push("/");
              }}
            >
              Delete Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 