import { getAllCharities, getRegisteredCharity } from "../actions";
import Map from "./MapPage";

export default async function MapPage() {
  const charitiesData = await getAllCharities();
  const currentCharity = await getRegisteredCharity();

  return (
    <Map charitiesData={charitiesData!} currentCharity={currentCharity!} />
  );
}