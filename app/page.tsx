"use client"

import { useState, } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Check, HeartHandshake } from "lucide-react"
import { Checkbox } from '@/components/ui/checkbox'

export default function LandingPage() {
  const [email, setEmail] = useState("");

  const features = [
      { title: "Charity Finder", description: "Locate charities based on cause, location, and needs to connect with organizations that align with your mission." },
      { title: "Resource Viewing and Sharing", description: "Browse available resources, share surplus supplies, and collaborate with other charities to maximize impact." },
      { title: "AI-Powered Recommendations", description: "Get smart suggestions for partnerships, resources, and funding opportunities tailored to your charity’s needs."}
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <header className="relative w-screen left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] py-14 py-12 text-center">
        <div className="flex items-center justify-center mb-4">
          <HeartHandshake className="hidden md:flex h-12 w-12 text-primary mr-2" />
          <h1 className="text-6xl font-bold">Connecting Hearts, Changing Lives</h1>
        </div>
        <p className="text-2xl font-semibold text-muted-foreground">Charity Network is a platform that connects charities, enabling them <br/> to share resources, collaborate, and amplify their impact for greater community support.</p>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 pt-10 mb-12 md:mb-0">
        <h2 className="text-3xl font-bold text-center mb-8">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardContent className="flex flex-col items-center p-6">
                <Check className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl text-center font-semibold mb-2">{feature.title}</h3>
                <p className="text-center text-muted-foreground">
                {feature.description}
                </p>
                {feature.title == "Filtered Menu" ? <p className="text-center text-muted-foreground italic pt-4">Coming soon...</p> : <p></p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="container mx-auto px-4 py-20 grid place-items-center">
        <div className="md:w-1/2 md:pr-8">
          <h2 className="text-3xl font-bold text-center md:text-left mb-8">Join Our Waitlist</h2>
          <form action="" method="POST" name="waitingList">
            {/* https://formspree.io/f/xgvwdrnd */}
            <div className="mb-6">
              <ul className="space-y-2">
                {[
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
              <Button type="submit" className="w-full md:w-auto" disabled>
                Join Waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}