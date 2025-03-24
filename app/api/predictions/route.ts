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
  
  // Basic statistics
  const totalTransfers = history.length;
  const totalQuantity = history.reduce((sum, transfer) => sum + transfer.quantity, 0);
  
  // Calculate date range
  const dates = history.map(transfer => new Date(transfer.time_sent));
  const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const dateRangeInDays = Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Get unique resource IDs
  const uniqueResourceIds = new Set(history.map(transfer => transfer.resource_id));
  
  // Categorize transfers by status
  const statusCounts: Record<string, number> = {};
  history.forEach(transfer => {
    statusCounts[transfer.status] = (statusCounts[transfer.status] || 0) + 1;
  });
  
  // Extract information about transfer descriptions if available
  const transfersWithDescriptions = history.filter(transfer => transfer.description && transfer.description.trim() !== '');
  
  // Analyze charity relationships
  const charityRelationships: Record<string, Set<string>> = {};
  history.forEach(transfer => {
    if (!charityRelationships[transfer.charity_from]) {
      charityRelationships[transfer.charity_from] = new Set();
    }
    charityRelationships[transfer.charity_from].add(transfer.charity_to);
  });
  
  // Build a comprehensive summary
  summary += `Resource transfer history shows ${totalTransfers} transactions spanning ${dateRangeInDays} days (from ${oldestDate.toLocaleDateString()} to ${newestDate.toLocaleDateString()}). `;
  summary += `A total of ${totalQuantity} items were transferred, involving ${uniqueResourceIds.size} unique resource types. `;
  
  // Add status information
  const statusSummary = Object.entries(statusCounts)
    .map(([status, count]) => `${count} ${status.toLowerCase()}`)
    .join(', ');
  summary += `Transfer statuses include: ${statusSummary}. `;
  
  // Add description information if available
  if (transfersWithDescriptions.length > 0) {
    const sampleDescriptions = transfersWithDescriptions
      .slice(0, Math.min(2, transfersWithDescriptions.length))
      .map(t => `"${t.description}"`)
      .join(', ');
    summary += `Notable transfers include ${sampleDescriptions}. `;
  }
  
  // Add charity relationship information
  const totalDonors = Object.keys(charityRelationships).length;
  
  // Create a set of all recipients without using spread operator
  const allRecipients = new Set<string>();
  Object.values(charityRelationships).forEach(recipientSet => {
    recipientSet.forEach(recipient => {
      allRecipients.add(recipient);
    });
  });
  const totalRecipients = allRecipients.size;
  
  summary += `Resource sharing involved ${totalDonors} donating organizations and ${totalRecipients} receiving organizations. `;
  
  // Identify potential trends
  if (totalTransfers >= 2) {
    // Sort by date to analyze chronological trends
    const sortedTransfers = [...history].sort((a, b) => 
      new Date(a.time_sent).getTime() - new Date(b.time_sent).getTime()
    );
    
    // Compare first and last transfer quantities to detect a simple trend
    const firstQuantity = sortedTransfers[0].quantity;
    const lastQuantity = sortedTransfers[sortedTransfers.length - 1].quantity;
    
    if (lastQuantity > firstQuantity) {
      summary += `Transfer quantities show an increasing trend from ${firstQuantity} to ${lastQuantity} units. `;
    } else if (lastQuantity < firstQuantity) {
      summary += `Transfer quantities show a decreasing trend from ${firstQuantity} to ${lastQuantity} units. `;
    } else {
      summary += `Transfer quantities remain stable at ${firstQuantity} units. `;
    }
  }
  
  return summary;
}

export async function POST(request: Request) {
  try {
    const { description, tags, categories, resources, resourceHistory, availableResources } = await request.json();
    
    // ChatGPT API configuration
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Process resource data for the prompt
    const currentResourcesSummary = resources ? summarizeResources(resources) : 'No current resource data available';
    const resourceHistorySummary = resourceHistory ? summarizeResourceHistory(resourceHistory) : 'No historical data available';
    const availableResourcesFromOtherCharities = availableResources ? summarizeResources(availableResources) : 'No available resources data available';

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

     Resources Available From Other Charities:
      ${availableResourcesFromOtherCharities}

     Today's Date: ${new Date().toLocaleDateString()}

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
        "recommendation": "Given ONLY the resources available from other charities, can you give me ONLY ONE charity that might be able to help TODAY with the predicted demand?"
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