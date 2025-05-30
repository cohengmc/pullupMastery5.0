import { useState } from "react";
import { CircleHelp, Contact, X } from "lucide-react";
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
import ContactForm from "./contact-form";

export function EmailButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        className={`md:relative md:-ml-6 absolute left-3 bottom-3 center p-3 rounded-full transition-colors ${
          isHovered ? "bg-destructive/30" : "bg-primary/30"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(true)}
      >
        <CircleHelp
          className={`w-6 h-6 ${
            isHovered ? "text-destructive" : "text-primary"
          }`}
        />
      </button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-[500px] w-[90vw] p-4 gap-2 max-h-[95vh] overflow-scroll">
          <AlertDialogTitle className="space-y-1 flex items-center">
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 bg-gray-700 hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex-1 text-center">
              <AlertDialogTitle className="text-base">
                Contact Us or Report an Issue
              </AlertDialogTitle>
            </div>
          </AlertDialogTitle>
          <ContactForm />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
