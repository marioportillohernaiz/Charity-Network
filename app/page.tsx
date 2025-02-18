"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check, ChevronDown, ChevronUp, Utensils } from "lucide-react"
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const scrollReviews = (direction: 'left' | 'right') => {
    if (reviewsRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200
      reviewsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    };
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      scrollReviews('right')
    }, 5000)

    return () => clearInterval(interval);
  }, []);
    
  const comments = ['"I miss the ease of having a choice and not being able to feel fully included at eateries.​"',
        '"Making people informed isn`t seen as a priority.​"',
        '"The only person I trust is myself and other sufferers.​"',
        '"Flight travel - Judgemental, dangerous, unsafe flight food.​"',
        '"​I get bored of the limited range of foods."',
        '"80% of package food feels unsafe.​"',
        '"Constantly terrified of being a burden to others.​"',
        '"I feel anxious dining out because my needs are often overlooked."'];

  const displayedComments = isSmallScreen && !showAll ? comments.slice(0, 2) : comments;
  
    const features = [
        { title: "Restaurant Finder", description: "Locate restaurants that cater to specific food allergies and dietary needs based on verified user feedback and restaurant information." },
        { title: "Verified User Reviews", description: "Read reviews from users with similar allergies, offering insights into their dining experiences and the safety of menu items." },
        { title: "Filtered Menu", description: "Easily filter restaurant menus to view only safe options for your allergies or dietary preferences, making dining decisions stress-free."}
    ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <header className="relative w-screen left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] py-14 py-12 text-center">
        <div className="flex items-center justify-center mb-4">
          <Utensils className="hidden md:flex h-12 w-12 text-primary mr-2" />
          <h1 className="text-6xl font-bold">Freedom to Eat</h1>
        </div>
        <p className="text-2xl font-semibold text-muted-foreground">Be the first to have freedom to eat as an allergy sufferer.</p>
        <Button className="mt-5 ">Join our WhatsApp Community<ArrowRight className="ml-2 h-4 w-4" /></Button>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 pt-10 mb-12 md:mb-0">
        <h2 className="text-3xl font-bold text-center mb-8">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="flex flex-col items-center p-6">
                <Check className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-center text-muted-foreground">
                {feature.description}
                </p>
                {feature.title == "Filtered Menu" ? <p className="text-center text-muted-foreground italic pt-4">Coming soon...</p> : <p></p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* User Reviews Section */}
      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-32 bg-[url('/background.png')]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Why us? Don't hear it from us, <br />
            hear it from your community
          </h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {displayedComments.map((review, index) => (
              <Card key={index} className="h-44 flex items-center justify-center m-4">
                <CardContent className="text-center">
                  <p className="font-semibold text-xl italic">{review}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {isSmallScreen && comments.length > 2 && (
            <div className="text-center mt-4">
              <Button variant="outline" onClick={() => setShowAll(!showAll)}>
                {showAll ? (
                  <>Show less<ChevronUp className="ml-2 h-4 w-4" /></>
                ) : (
                  <>Show more...<ChevronDown className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="container mx-auto px-4 py-28">
        <div className="flex flex-col md:flex-row items-center justify-center">
          <div className="md:w-1/2 md:pr-8">
            <h2 className="text-3xl font-bold text-center md:text-left mb-8">Join Our Waitlist</h2>
            <form action="https://formspree.io/f/xgvwdrnd" method="POST" name="waitingList">
              <div className="mb-6">
                <ul className="space-y-2">
                  {[
                    { text: "I wish to participate in a 20-minute phone interview to share my experiences.", name: "Interviews on call" },
                    { text: "I wish to contribute to online surveys to help shape new features and improve the platform.", name: "Online Surveys" },
                    { text: "I wish to join user trials where I will test new features and provide feedback on how they work.", name: "User Trials" },
                    { text: "I wish to share my suggestions to help improve the service for people with food allergies.", name: "User Suggestions" }
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Checkbox id={`benefit-${index}`} name={benefit.name} value="tick" />
                      <label
                        htmlFor={`benefit-${index}`}
                        className="text-m font-medium leading-tight"
                      >
                        {benefit.text}
                      </label>
                    </li>
                  ))}
                </ul>
                <p className="text-xs pt-4">
                  Your email will be used solely to keep you updated on our launch! (and to follow up with any contribution ticked above)
                </p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 pt-6">
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-grow"
                />
                <Button type="submit" className="w-full md:w-auto">
                  Join Waitlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          <div className="md:w-1/2 md:pl-8 flex flex-col justify-center items-center md:items-start mt-12 md:mt-0">
            <h2 className="text-3xl font-bold text-center md:text-left mb-8">Book a Meeting with Us</h2>
            <Button className="w-full md:w-auto">
              Book Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}