// RESOURCE PAGE LAYOUT 
// Fetches data and redirects if user is not authenticated or charity profile is not verified or complete

import { getAllCharities, getAllResourceData, getAuthUser, getCharityResourceData, getRegisteredCharity, getResourceTransitData, getSalesData } from "@/app/actions";
import ResourcePage from "./ResourcePage"
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getAuthUser();
  const charityData = await getAllCharities();
  const currentCharity = await getRegisteredCharity();
  const resourceData = await getCharityResourceData();
  const allResourcesData = await getAllResourceData();
  const transitData = await getResourceTransitData();
  const salesData = await getSalesData();

  if (!user) {
    return redirect("/sign-in");
  }

  if (!currentCharity) {
    return redirect("/protected/account-page");
  }
  
  return (
    <ResourcePage charity={currentCharity} charityData={charityData} resourceData={resourceData} allResourcesData={allResourcesData} transitData={transitData} salesData={salesData} />
  )
}