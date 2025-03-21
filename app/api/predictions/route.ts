// app/api/predictions/route.ts
import { NextResponse } from 'next/server';

// Helper function to summarize current resources
function summarizeResources(resources: ResourcesData[]) {
  if (!resources || resources.length === 0) {
    return 'No resources data available';
  }

  // Group resources by category
  const categorySummary: Record<string, { total: number, items: string[] }> = {};
  
  resources.forEach(resource => {
    if (!categorySummary[resource.category]) {
      categorySummary[resource.category] = { total: 0, items: [] };
    }
    
    categorySummary[resource.category].total += resource.quantity;
    categorySummary[resource.category].items.push(`${resource.name} (${resource.quantity} ${resource.unit})`);
  });
  
  // Format the summary
  let summary = '';
  Object.entries(categorySummary).forEach(([category, data]) => {
    summary += `- ${category}: ${data.total} total items\n`;
    summary += `  Top items: ${data.items.slice(0, 3).join(', ')}\n`;
  });
  
  return summary;
}

// Helper function to summarize resource history
function summarizeResourceHistory(history: any[]) {
  if (!history || history.length === 0) {
    return 'No historical data available';
  }
  
  let summary = '';
  
  // If history data is available, format it appropriately
  // This assumes a specific format of the history data, adjust as needed
  if (Array.isArray(history)) {
    summary += `- Historical data spans ${history.length} periods\n`;
    
    // Extract trends if possible
    const categories = new Set<string>();
    history.forEach(period => {
      if (period.categories) {
        Object.keys(period.categories).forEach(cat => categories.add(cat));
      }
    });
    
    // Summarize trends for each category
    categories.forEach(category => {
      const trend = analyzeTrend(history, category);
      summary += `- ${category}: ${trend}\n`;
    });
  }
  
  return summary;
}

// Helper function to analyze trends in historical data
function analyzeTrend(history: any[], category: string) {
  // This is a simplified version - enhance based on your actual data structure
  const values = history
    .map(period => period.categories?.[category] || 0)
    .filter(val => val > 0);
  
  if (values.length < 2) {
    return 'Insufficient data for trend analysis';
  }
  
  // Calculate simple trend
  const firstVal = values[0];
  const lastVal = values[values.length - 1];
  const percentChange = ((lastVal - firstVal) / firstVal) * 100;
  
  if (percentChange > 20) return 'Strong increasing trend';
  if (percentChange > 5) return 'Moderate increasing trend';
  if (percentChange > -5) return 'Stable trend';
  if (percentChange > -20) return 'Moderate decreasing trend';
  return 'Strong decreasing trend';
}

export async function POST(request: Request) {
  try {
    const { description, tags, categories, resources, resourceHistory } = await request.json();
    
    // ChatGPT API configuration
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Process resource data for the prompt
    const currentResourcesSummary = resources ? summarizeResources(resources) : 'No current resource data available';
    const resourceHistorySummary = resourceHistory ? summarizeResourceHistory(resourceHistory) : 'No historical resource data available';

    // Format the prompt for more structured and useful predictions
    const prompt = `
      You are an AI that specializes in charity resource demand forecasting.
      Based on the following charity information, predict the seasonal demand trends (monthly) for different resource categories.

      Charity Description: ${description || 'No description provided'}
      Primary Category: ${categories?.primary || 'Not specified'}
      Secondary Categories: ${categories?.secondary?.join(', ') || 'None'}
      Tags: ${tags?.join(', ') || 'None'}

      Current Resources:
      ${currentResourcesSummary}

      Resource History:
      ${resourceHistorySummary}

      Provide a structured monthly forecast for the following resource categories:
      1. Food
      2. Clothing & Personal Items
      3. Medical & Health Supplies
      4. Housing & Homelessness

      For each month (January through December), provide numeric values representing relative demand (scale of 0-100, where 100 is peak demand).
      
      Format your response as a valid JSON object like this:
      {
        "food": {
          "Jan": 70,
          "Feb": 65,
          ...and so on
        },
        "clothing": {
          "Jan": 85,
          "Feb": 75,
          ...and so on
        },
        "medical": {
          "Jan": 50,
          "Feb": 55,
          ...and so on
        },
        "housing": {
          "Jan": 50,
          "Feb": 55,
          ...and so on
        },
        "explanation": "A brief explanation of why these predictions were made, considering the charity's profile, resource levels, and seasonal factors."
      }

      Consider the following factors in your prediction:
      - The charity's current resource levels and where they might be lacking
      - Historical resource usage patterns from the provided history
      - Seasonal factors like weather patterns and holidays
      - School terms/holidays in the region
      - Typical donation cycles
      - Economic patterns
      - The specific needs based on the charity's categories and tags
    `;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a specialized AI that forecasts charity resource needs based on descriptions and categories.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'OpenAI API error' }, { status: response.status });
    }
    
    // Extract the JSON from the OpenAI response
    try {
      const content = data.choices[0].message.content;
      // Find JSON in the response (in case there's additional text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const predictionJson = JSON.parse(jsonMatch[0]);
        return NextResponse.json(predictionJson);
      } else {
        // If no JSON structure was found, return an error
        return NextResponse.json({ error: 'Could not parse prediction data' }, { status: 422 });
      }
    } catch (error) {
      console.error('Error parsing GPT response:', error);
      return NextResponse.json({ error: 'Failed to parse prediction data' }, { status: 422 });
    }
  } catch (error) {
    console.error('Prediction API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}