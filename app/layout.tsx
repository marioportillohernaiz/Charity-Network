import HeaderAuth from "@/components/header-auth";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Image from 'next/image';
import "./globals.css";
import { InstagramIcon, LinkedinIcon, YoutubeIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Script from 'next/script';
import WorkingProgressPage from "./working-progress/page";
import { Badge } from "@/components/ui/badge";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Freeater",
  description: "Freeater an innovative platform for users with food allergies, enabling verified feedback on restaurant allergy accommodations across the UK. Developed by Mario Portillo Hernaiz",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: { user },
  } = await createClient().auth.getUser();

  const userIsBusiness = user?.user_metadata.display_name === "eatery";

  // CHANGE THIS VARIABLE TO TRUE IF YOU WISH TO LEAVE THE WEBSITE ON MAINTENANCE MODE
  const is_maintenance = false;
  
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
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
          <Script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-Y5J8GD0BCE');
            `}
          </Script>
        </head>
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
                      <Image src="/logo-removebg.png" alt="Image" width="180" height="180" color="white" />
                    </a>
                    {userIsBusiness ? <Badge variant="secondary">Business Account</Badge> : null}
                  </div>
                  <HeaderAuth is_maintenance={is_maintenance} userIsBusiness={userIsBusiness} />
                </div>
              </nav>
              
              {is_maintenance ? (
                <WorkingProgressPage />
              ) : (
                <div className="flex flex-col gap-20 p-5 max-w-5xl w-full"> {/**/}
                  {children}
                </div>
              )}

              <footer className="w-full mt-auto py-12 px-4 sm:px-6 lg:px-8 bg-[hsl(var(--layout-background))]">
                <div className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">About Freeater</h2>
                      <p className="text-sm text-muted-foreground">
                        Empowering everyone with any dietary restrictions to eat freely, whether at a 
                        local restaurant, enjoying a takeaway or dining out abroad. Join our online community 
                        which shares one common goal: freedom to eat.
                      </p>
                    </div>
                    
                    {/* <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Quick Links (In progress)</h2>
                      <nav>
                        <ul className="space-y-1 text-sm">
                          <li><a href="/protected/about-page" className="text-sm hover:underline">• Your Freeater Team</a></li>
                          <li>• FAQ</li>
                          <li>• Terms and Conditions</li>
                          <li>• Privacy Policy</li>
                        </ul>
                      </nav>
                    </div> */}
                    
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Contact Us With Any Queries</h2>
                      {/* <p className="text-sm">
                        Website Queries: <a href="mailto:mario@freeater.com" className="hover:underline">mario@freeater.com</a>
                      </p> */}
                      <p className="text-sm">
                        Email: <a href="mailto:info@freeater.com" className="hover:underline">info@freeater.com</a>
                      </p>
                      <div className="flex space-x-2">
                        <a href="https://www.tiktok.com/@freeaterltd" aria-label="TikTok" className="text-foreground hover:text-secondary">
                          <img src="/tiktok_icon.svg" className="h-6 w-6" />
                        </a>
                        <a href="https://www.instagram.com/freeaterltd/" aria-label="Instagram" className="text-foreground hover:text-secondary pr-1">
                          <InstagramIcon className="h-6 w-6" />
                        </a>
                        <a href="https://www.linkedin.com/company/freeater/" aria-label="LinkedIn" className="text-foreground hover:text-secondary">
                          <LinkedinIcon className="h-6 w-6" />
                        </a>
                        <a href="https://www.youtube.com/@FreeaterLtd" aria-label="Youtube" className="text-foreground hover:text-secondary  pr-1">
                          <YoutubeIcon className="h-6 w-6" />
                        </a>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold">Featured In:</h2>
                      <div className="grid grid-cols-3">
                        <Image src="/websummitlogo.jpg" alt="Image" width="100" height="100" className="pt-5"/>
                        <Image src="/lenlogo.png" alt="Image" width="100" height="100" className="pt-2"/>
                        <Image src="/mvp.jpg" alt="Image" width="100" height="100" className="pt-6"/>
                        <div></div>
                      </div>
                    </div>
                    <div>
                      <form action="https://formspree.io/f/xgvwdrnd" name="waitingList" method="POST" className="grid grid-rows-3 grid-cols-1 gap-2">
                        <h2 className="text-lg font-semibold">Waitlist:</h2>
                        <Input type="email" id="email" name="email" placeholder="Enter your email" required />
                        <Button type="submit" className="w-full" variant={"outline"} disabled={is_maintenance}>Join</Button>
                      </form>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-border">
                    <p className="text-xs text-center text-muted-foreground">
                      Disclaimer: Information provided by Freeater is based on user submissions and restaurant data. Always verify allergen information with the restaurant directly before dining.
                    </p>
                  </div>
                  <div className="container mx-auto px-4 text-center text-muted-foreground">
                    &copy; 2024 Freeater. All rights reserved.
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
