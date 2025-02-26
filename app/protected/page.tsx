import { getAllCharities, getCommentData, getRegisteredCharity } from "../actions";
import Map from "../map-page/MapPage";

export default async function MapPage() {
  const charitiesData = await getAllCharities();
  const currentCharity = await getRegisteredCharity();
  const commentsData = await getCommentData();

  return (
    <Map charitiesData={charitiesData!} currentCharity={currentCharity!} commentsData={commentsData} />
  );
}