import Map from "./MapPage";
import { getAllCharities, getRegisteredCharity } from "./actions";

export default async function LandingPage() {
  const charitiesData = await getAllCharities();
  const currentCharity = await getRegisteredCharity();

  return (
    <Map charitiesData={charitiesData!} currentCharity={currentCharity!} />
  );
}