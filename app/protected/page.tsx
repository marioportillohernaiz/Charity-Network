import { getAllCharities, getAllResourceData, getAuthUser, getCommentData, getRegisteredCharity, getResourceTransitData } from "../actions";
import Map from "./MapPage";
import { redirect } from "next/navigation";

export default async function MapPage() {
  const user = await getAuthUser();
  const charitiesData = await getAllCharities();
  const currentCharity = await getRegisteredCharity();
  const commentsData = await getCommentData();
  const transitData = await getResourceTransitData();
  const resourcesData = await getAllResourceData();
  
  if (!user) {
    return redirect("/sign-in");
  }

  if (!currentCharity || currentCharity?.admin_verified === false) {
    return redirect("/protected/account-page");
  }

  return (
    <Map charitiesData={charitiesData!} currentCharity={currentCharity!} commentsData={commentsData} transitData={transitData} resourcesData={resourcesData} />
  );
}