
import { getAllCharities, getAllResourceData, getAuthUser, getRegisteredCharity, getResourceTransitData, getSalesData } from "@/app/actions";
import { redirect } from "next/navigation";
import RequestResourcesPage from "./RequestPage";

export default async function RequestPage() {
  const user = await getAuthUser();
  const resourceData = await getAllResourceData();
  const transitData = await getResourceTransitData();
  const charityData = await getAllCharities();
  const currentCharity = await getRegisteredCharity();
  const salesData = await getSalesData();

  if (!user) {
    return redirect("/sign-in");
  }

  if (!currentCharity || currentCharity?.admin_verified === false) {
    return redirect("/protected/account-page");
  }

  return (
    <RequestResourcesPage resourceData={resourceData} transitData={transitData} charityData={charityData} charity={currentCharity} salesData={salesData} />
  )
}