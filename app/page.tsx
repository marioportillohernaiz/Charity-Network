"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, ChevronRight, CircleCheck } from "lucide-react"
import Link from "next/link";
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const features = [
      { title: "Charity Finder", description: "Locate charities based on cause, location, and needs to connect with organizations that align with your mission." },
      { title: "Resource Viewing and Sharing", description: "Browse available resources, share surplus supplies, and collaborate with other charities to maximize impact." },
      { title: "AI-Powered Recommendations", description: "Get smart suggestions for partnerships, resources, and funding opportunities tailored to your charity’s needs."}
  ];

  const plans = [
    {
      name: "Starter",
      price: 19,
      description:
        "Basic features for small charities just getting started with resource sharing and networking.",
      features: [
        "Charity Finder access",
        "Basic resource management",
        "5 resource requests per month",
        "Single location tracking"
      ],
      buttonText: "Start Your Journey",
    },
    {
      name: "Advanced",
      price: 29,
      isRecommended: true,
      description:
        "Enhanced features for growing charities with moderate resource sharing needs.",
      features: [
        "AI-powered resource recommendations",
        "Up to 50 resources cataloged",
        "15 resource requests per month",
        "Multiple location tracking"
      ],
      buttonText: "Upgrade Your Impact",
      isPopular: true,
    },
    {
      name: "Premium",
      price: 49,
      description:
        "Comprehensive solution for established charities with complex resource sharing requirements.",
      features: [
        "Advanced AI prediction analytics",
        "Unlimited resource catalog",
        "Unlimited resource requests",
        "Multi-branch location management"
      ],
      buttonText: "Maximize Your Reach",
    },
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
                <Button asChild size="lg" disabled>
                  <Link href="#">Donate Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" disabled>
                  <Link href="#">
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
      <section id="about" className="w-full py-16">
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
      <section className="container mx-auto px-4 mb-14">
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

      <section id="pricing" className="max-w-screen-lg mx-auto py-12 xs:py-20 px-6">
        <h1 className="text-4xl xs:text-5xl font-bold text-center tracking-tight">
          Pricing
        </h1>
        <div className="mt-8 xs:mt-14 grid grid-cols-1 lg:grid-cols-3 items-center gap-8 lg:gap-0">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative bg-accent/50 border p-7 rounded-xl lg:rounded-none lg:first:rounded-l-xl lg:last:rounded-r-xl",
                {
                  "bg-background border-[2px] border-primary py-12 !rounded-xl":
                    plan.isPopular,
                }
              )}
            >
              {plan.isPopular && (
                <Badge className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                  Most Popular
                </Badge>
              )}
              <h3 className="text-lg font-medium">{plan.name}</h3>
              <p className="mt-2 text-4xl font-bold">
                ${plan.price} 
                <span className="mt-4 text-lg font-medium text-muted-foreground">/month</span>
              </p>
              <p className="mt-4 font-medium text-muted-foreground">
                {plan.description}
              </p>
              <Separator className="my-6" />
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CircleCheck className="h-4 w-4 mt-1 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.isPopular ? "default" : "outline"}
                size="lg"
                className="w-full mt-6 rounded-full"
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}