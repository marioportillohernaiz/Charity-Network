"use client"

import { useState, } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Check, ChevronRight, HeartHandshake } from "lucide-react"
import Link from "next/link";
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

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
      <section className="w-full py-10">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:gap-12 grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-6xl font-bold">Connecting Hearts, Changing Lives</h1>
                <p className="text-muted-foreground md:text-xl">A platform that connects charities, enabling them to share resources, collaborate, and amplify their impact for greater community support.</p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="#donate">Donate Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#learn-more">
                    Learn More
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <img
              src="/mission.jpg"
              width={400}
              height={400}
              className="mx-auto aspect-square overflow-hidden rounded-xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* About us section */}
      <section id="about" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge className="inline-block px-3 py-1 text-sm">
                Our Mission
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Making The World A Better Place</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Founded in 2010, CharityHope has been dedicated to addressing critical needs in communities around the
                world. We believe in sustainable development and empowering individuals to create lasting change.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <img
              src="/community.jpg"
              width={500}
              height={500}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center"
            />
            <div className="flex flex-col justify-center space-y-4">
              <ul className="grid gap-6">
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Our Vision</h3>
                    <p className="text-muted-foreground">A world where every charity has access to the resources they need to thrive and reach their fullpotential.</p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Our Values</h3>
                    <p className="text-muted-foreground">Compassion, integrity, accountability, and innovation guide everything we do.</p>
                  </div>
                </li>
                <li>
                  <div className="grid gap-1">
                    <h3 className="text-xl font-bold">Our Approach</h3>
                    <p className="text-muted-foreground">We collaborate with local communities to develop sustainable solutions that address root causes, not just symptoms.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 mb-12 md:mb-0">
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