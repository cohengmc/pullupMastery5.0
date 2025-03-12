import { ThemeSwitcher } from "@/components/theme-switcher";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { NavLogo } from "@/components/nav-logo";
import { Toaster } from "sonner";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Pull Up Mastery",
  description: "Track and improve your pull-up journey",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.className} h-full`} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body className="bg-background text-foreground h-full overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="h-screen w-full flex flex-col items-center overflow-hidden">
            <div className="h-full w-full flex flex-col items-center">
              <nav className="w-full hidden md:flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5">
                  <NavLogo />
                  <ThemeSwitcher />
                </div>
              </nav>
              <div className="flex flex-col w-full p-0 md:w-[80vw] md:p-5">
                {children}
              </div>

              <footer className="w-full hidden md:flex items-center justify-center mx-auto text-center text-xs gap-8">
                With ❤️ from Geoff
              </footer>
            </div>
          </main>
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
