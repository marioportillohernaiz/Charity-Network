import HeaderAuth from "@/components/header-auth";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Image from 'next/image';
import "./globals.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Script from 'next/script';
import WorkingProgressPage from "./working-progress/page";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Charity Network",
  description: "Charity Network an innovative platform for charities across the UK to help with communication and resource sharing. Developed by Mario Portillo Hernaiz",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // CHANGE THIS VARIABLE TO TRUE IF YOU WISH TO LEAVE THE WEBSITE ON MAINTENANCE MODE
  const is_maintenance = false;
  
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.ico" sizes="any" />
        <link href="https://calendar.google.com/calendar/scheduling-button-script.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""/>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin="" />

        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-Y5J8GD0BCE" />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-5 items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-[hsl(var(--layout-background))]">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm ">
                  <div className="flex gap-5 font-semibold">
                    {/* <ThemeSwitcher /> */}
                    <a href="/">
                      <Image src="/logo.png" alt="Image" width="200" height="200" color="white" />
                    </a>
                  </div>
                  <HeaderAuth is_maintenance={is_maintenance} />
                </div>
              </nav>
              
              {is_maintenance ? (
                <WorkingProgressPage />
              ) : (
                <div className="flex flex-col gap-20 p-5 max-w-5xl w-full"> {/**/}
                  {children}
                </div>
              )}

              <footer className="w-full mt-auto py-12 px-4 sm:px-6 lg:px-8 bg-[hsl(var(--layout-background))] text-white">
                <div className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">About Charity Network</h2>
                      <p className="text-sm">
                        Charity Network is a platform designed to connect charities, enabling them to collaborate, share resources, and maximize their community impact through AI-powered recommendations and seamless networking.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Contact Us</h2>
                      <p className="text-sm">
                        Email: <a href="mailto:portillomario407@gmail.com" className="hover:underline">portillomario407@gmail.com</a>
                      </p>
                    </div>

                    <div>
                      <form action="https://formspree.io/f/xgvwdrnd" name="waitingList" method="POST" className="grid grid-rows-3 grid-cols-1 gap-2">
                        <h2 className="text-lg font-semibold">Waitlist:</h2>
                        <Input type="email" id="email" name="email" placeholder="Enter your email" required />
                        <Button type="submit" className="w-full text-black" variant={"outline"} disabled>Join</Button>
                      </form>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-border">
                    <p className="text-sm text-center">
                      &copy; 2025 Charity Network. All rights reserved.
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
