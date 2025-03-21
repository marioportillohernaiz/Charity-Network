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
};

export async function fetchSeasonalPredictions(charityData: CharityData): Promise<SeasonalPrediction | null> {
  try {
    const response = await fetch('/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: charityData.description,
        tags: charityData.category_and_tags?.tags,
        categories: charityData.category_and_tags
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

// Transform the API prediction data into the format expected by the chart
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