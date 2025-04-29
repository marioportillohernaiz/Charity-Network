import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SeasonalPrediction = {
  food: Record<string, number>;
  clothing: Record<string, number>;
  medical: Record<string, number>;
  housing: Record<string, number>;
  explanation?: string;
  recommendation?: string;
  impact?: string;
};

export async function fetchSeasonalPredictions(charityData: CharityData, resourceData: ResourcesData[], transitData: TransitData[], salesData: Sales[]): Promise<SeasonalPrediction | null> {

  try {
    const response = await fetch('/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: charityData.description,
        tags: charityData.category_and_tags?.tags,
        categories: charityData.category_and_tags,
        resources: resourceData.filter(resource => resource.charity_id === charityData.id),
        resourceHistory: transitData.filter(transit => (transit.charity_from === charityData.id || transit.charity_to === charityData.id) && transit.status === 'Received'),
        availableResources: resourceData.filter(resource => resource.charity_id !== charityData.id && resource.shareable_quantity > 0),
        salesData: salesData
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log(error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch predictions:', error);
    return null;
  }
}

export function transformPredictionsToChartData(predictions: SeasonalPrediction) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map(month => ({
    month,
    food: predictions.food[month] || 0,
    clothing: predictions.clothing[month] || 0,
    medical: predictions.medical[month] || 0,
    housing: predictions.housing[month] || 0,
  }));
}