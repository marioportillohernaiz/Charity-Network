
import { getAllCharities, getAllResourceData, getAuthUser, getRegisteredCharity, getResourceTransitData } from "@/app/actions";
import { redirect } from "next/navigation";
import RequestResourcesPage from "./RequestPage";

export default async function RequestPage() {
  const user = await getAuthUser();
  const resourceData = await getAllResourceData();
  const transitData = await getResourceTransitData();
  const charityData = await getAllCharities();
  const charity = await getRegisteredCharity();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <RequestResourcesPage resourceData={resourceData} transitData={transitData} charityData={charityData} charity={charity} />
  )
}