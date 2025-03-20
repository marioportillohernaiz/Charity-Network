import { getAllCharities, getCommentData, getRegisteredCharity, getResourceTransitData } from "../actions";
import Map from "./MapPage";

export default async function MapPage() {
  const charitiesData = await getAllCharities();
  const currentCharity = await getRegisteredCharity();
  const commentsData = await getCommentData();
  const transitData = await getResourceTransitData();
  

  return (
    <Map charitiesData={charitiesData!} currentCharity={currentCharity!} commentsData={commentsData} transitData={transitData} />
  );
}