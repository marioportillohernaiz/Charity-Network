
import { getAllCharities, getAuthUser, getCharityResourceData, getRegisteredCharity, getResourceTransitDataFrom, getResourceTransitDataTo } from "@/app/actions";
import ResourcePage from "./ResourcePage"
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getAuthUser();
  const resourceData = await getCharityResourceData();
  const resourceTransitFrom = await getResourceTransitDataFrom();
  const resourceTransitTo = await getResourceTransitDataTo()
  const charityData = await getAllCharities();

  if (!user) {
    return redirect("/sign-in");
  }
  
  return (
    <ResourcePage charityData={charityData} resourceData={resourceData} resourceTransitFrom={resourceTransitFrom} resourceTransitTo={resourceTransitTo} />
  )
}