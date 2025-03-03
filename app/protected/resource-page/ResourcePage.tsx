"use-client"

import Link from "next/link"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RequestsList from "./requests-list"
import ResourcesList from "./resources-list"
import { AddResources } from "@/components/component/add-resources"
import OverviewTab from "./overview"
import HistoryTab from "./history"
import { Toaster } from "sonner"

export default function DashboardPage({charityData,resourceData,resourceTransitFrom,resourceTransitTo}:{charityData: CharityData[];resourceData: ResourcesData[]; resourceTransitFrom: TransitData[]; resourceTransitTo:TransitData[]}) {
  return (
    <div className="flex min-h-screen flex-col space-y-6 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources Dashboard</h1>
          <p className="text-muted-foreground">Manage and track your charity&apos;s resources</p>
        </div>
        <div className="flex items-center space-x-2">
          <AddResources resource={null} action={"add"} />
          <Link href="/requests/new">
            <Button variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Request Resources
            </Button>
          </Link>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab resourceData={resourceData} />
        </TabsContent>
        <TabsContent value="resources" className="space-y-4">
          <ResourcesList resourceData={resourceData} />
        </TabsContent>
        <TabsContent value="requests" className="space-y-4">
          <RequestsList resourceData={resourceData} />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <HistoryTab charityData={charityData} resourceData={resourceData} resourceTransitFrom={resourceTransitFrom} resourceTransitTo={resourceTransitTo} />
        </TabsContent>
      </Tabs>
      <Toaster richColors />
    </div>
  )
}