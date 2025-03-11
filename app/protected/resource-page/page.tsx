
import { getAllCharities, getAuthUser, getCharityResourceData, getRegisteredCharity, getResourceTransitData } from "@/app/actions";
import ResourcePage from "./ResourcePage"
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getAuthUser();
  const charityData = await getAllCharities();
  const charity = await getRegisteredCharity();
  const resourceData = await getCharityResourceData();
  const transitData = await getResourceTransitData();

  if (!user) {
    return redirect("/sign-in");
  }
  
  return (
    <ResourcePage charity={charity} charityData={charityData} resourceData={resourceData} transitData={transitData} />
  )
}