"use client";

import { NavBar } from "@/components/nav-bar";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";
import { EmailButton } from "app/components/email-button";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className="w-full h-full md:flex md:items-center md:justify-center md:bg-gray-100">
      <main className="w-full h-full md:w-[667px] md:h-[375px] md:rounded-[20px] md:shadow-lg md:overflow-hidden flex flex-col items-center bg-background">
        <div className="flex flex-col h-full w-full">
          {isHomePage && <NavBar />}
          <div className="flex flex-col w-full p-0 flex-1">{children}</div>
          {isHomePage && (
            <div className="flex">
              <div className="md:ml-6">
                {/* Email Button */}
                <EmailButton />
              </div>
              <footer className="w-full md:flex md:-ml-12 items-center justify-center mx-auto text-center text-xs gap-1 pb-5">
                With ❤️ from{" "}
                <a
                  href="https://geoffy.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                >
                  Geoff
                </a>
              </footer>
            </div>
          )}
        </div>
        <Toaster position="bottom-center" />
      </main>
    </div>
  );
}
