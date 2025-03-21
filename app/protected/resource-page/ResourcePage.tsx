"use client"

import Link from "next/link"
import { ArrowUpDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RequestsList from "./requests-list"
import ResourcesList from "./resources-list"
import { AddResources } from "@/components/component/add-resources-dialog"
import OverviewTab from "./overview"
import HistoryTab from "./history"
import { Toaster } from "sonner"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { RegisterSales } from "@/components/component/register-sales-dialog"

export default function DashboardPage({charity,charityData,resourceData,transitData}:{charity: CharityData; charityData: CharityData[];resourceData: ResourcesData[]; transitData: TransitData[];}) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [clickedItem, setClickedItem] = useState<string | null>(null);

  const handleNavigation = (event: React.MouseEvent, path: string) => {
    event.preventDefault();
    setClickedItem(path);

    startTransition(() => {
      router.push(path);
    });
  };
  
  return (
    <div className="flex min-h-screen flex-col space-y-6 p-4 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Resources Dashboard</h1>
          <p className="text-muted-foreground">Manage and track your charity&apos;s resources</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AddResources resource={null} action={"add"} />
          <RegisterSales />
          <div className="hidden md:block h-8 w-px bg-gray-300 mx-1"></div>
          <Button asChild variant="outline" onClick={(e) => handleNavigation(e, "/protected/request-page")}>
            <span>
              {loading && clickedItem === "/protected/request-page" ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : (<ArrowUpDown className="mr-2 h-4 w-4" />) }
              <Link href="/protected/request-page">Request</Link>
            </span>
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full md:w-1/2 grid grid-cols-4">
          <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="resources" className="text-xs md:text-sm">Resources</TabsTrigger>
          <TabsTrigger value="requests" className="text-xs md:text-sm">Requests</TabsTrigger>
          <TabsTrigger value="history" className="text-xs md:text-sm">History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab resourceData={resourceData} requestData={transitData} charity={charity} />
        </TabsContent>
        <TabsContent value="resources" className="space-y-4">
          <ResourcesList resourceData={resourceData} />
        </TabsContent>
        <TabsContent value="requests" className="space-y-4">
          <RequestsList charity={charity} charityData={charityData} resourceData={resourceData} transitData={transitData} />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <HistoryTab charity={charity} charityData={charityData} resourceData={resourceData} transitData={transitData} />
        </TabsContent>
      </Tabs>
      <Toaster richColors />
    </div>
  )
}