// PREDICTIONS API ROUTE
// This API route handles requests to the chatbot, processes the input data, and returns a response from OpenAI's GPT-3.5 model.

import { NextResponse } from 'next/server';

// Helper function to summarize current resources
function summarizeResources(resources: ResourcesData[]) {
  if (!resources || resources.length === 0) {
    return 'No resources data available';
  }

  const categorySummary: Record<string, { total: number, items: string[] }> = {};
  
  resources.forEach(resource => {
    if (!categorySummary[resource.category]) {
      categorySummary[resource.category] = { total: 0, items: [] };
    }
    
    categorySummary[resource.category].total += resource.quantity;
    categorySummary[resource.category].items.push(`${resource.name} (${resource.quantity} ${resource.unit})`);
  });
  
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
  const totalTransfers = history.length;
  const totalQuantity = history.reduce((sum, transfer) => sum + transfer.quantity, 0);
  
  const dates = history.map(transfer => new Date(transfer.time_sent));
  const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const dateRangeInDays = Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const uniqueResourceIds = new Set(history.map(transfer => transfer.resource_id));
  
  const statusCounts: Record<string, number> = {};
  history.forEach(transfer => {
    statusCounts[transfer.status] = (statusCounts[transfer.status] || 0) + 1;
  });
  
  const transfersWithDescriptions = history.filter(transfer => transfer.description && transfer.description.trim() !== '');
  
  const charityRelationships: Record<string, Set<string>> = {};
  history.forEach(transfer => {
    if (!charityRelationships[transfer.charity_from]) {
      charityRelationships[transfer.charity_from] = new Set();
    }
    charityRelationships[transfer.charity_from].add(transfer.charity_to);
  });
  
  summary += `Resource transfer history shows ${totalTransfers} transactions spanning ${dateRangeInDays} days (from ${oldestDate.toLocaleDateString()} to ${newestDate.toLocaleDateString()}). `;
  summary += `A total of ${totalQuantity} items were transferred, involving ${uniqueResourceIds.size} unique resource types. `;
  
  const statusSummary = Object.entries(statusCounts)
    .map(([status, count]) => `${count} ${status.toLowerCase()}`)
    .join(', ');
  summary += `Transfer statuses include: ${statusSummary}. `;
  
  if (transfersWithDescriptions.length > 0) {
    const sampleDescriptions = transfersWithDescriptions
      .slice(0, Math.min(2, transfersWithDescriptions.length))
      .map(t => `"${t.description}"`)
      .join(', ');
    summary += `Notable transfers include ${sampleDescriptions}. `;
  }
  
  const totalDonors = Object.keys(charityRelationships).length;
  
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
    const sortedTransfers = [...history].sort((a, b) => 
      new Date(a.time_sent).getTime() - new Date(b.time_sent).getTime()
    );
    
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

// Helper function to summarize sales register data
function summarizeSalesData(salesData: Sales[]) {
  if (!salesData || salesData.length === 0) {
    return 'No sales data available';
  }
  
  let summary = '';
  
  try {
    const dates = salesData.map(sale => new Date(sale.date_to));
    const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const dateRangeInDays = Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let totalSalesAmount = 0;
    let categorySales: Record<string, number> = {};
    let monthlySales: Record<string, number> = {};
    
    salesData.forEach(sale => {
      if (!sale.sales_data) return;
      
      const saleDate = new Date(sale.date_to);
      const monthKey = saleDate.toLocaleString('default', { month: 'short' });
      
      // Process each sale item
      sale.sales_data.forEach(item => {
        totalSalesAmount += item.amount;
        
        if (!categorySales[item.category]) {
          categorySales[item.category] = 0;
        }
        categorySales[item.category] += item.amount;
        
        if (!monthlySales[monthKey]) {
          monthlySales[monthKey] = 0;
        }
        monthlySales[monthKey] += item.amount;
      });
    });
    
    // Build comprehensive summary
    summary += `Sales data shows ${salesData.length} records spanning ${dateRangeInDays} days (from ${oldestDate.toLocaleDateString()} to ${newestDate.toLocaleDateString()}). `;
    summary += `Total sales amount: £${totalSalesAmount.toFixed(2)}. `;
    
    const sortedCategories = Object.entries(categorySales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (sortedCategories.length > 0) {
      summary += `Top selling categories: `;
      summary += sortedCategories
        .map(([category, amount]) => `${category} (£${amount.toFixed(2)})`)
        .join(', ');
      summary += `. `;
    }
    
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sortedMonthlyData = Object.entries(monthlySales)
      .sort((a, b) => monthOrder.indexOf(a[0]) - monthOrder.indexOf(b[0]));
    
    if (sortedMonthlyData.length > 0) {
      const highestMonth = Object.entries(monthlySales).reduce((prev, current) => 
        (current[1] > prev[1]) ? current : prev
      );
      
      const lowestMonth = Object.entries(monthlySales).reduce((prev, current) => 
        (current[1] < prev[1]) ? current : prev
      );
      
      summary += `Highest sales were in ${highestMonth[0]} (£${highestMonth[1].toFixed(2)}), `;
      summary += `and lowest in ${lowestMonth[0]} (£${lowestMonth[1].toFixed(2)}). `;
    }
    
    if (sortedMonthlyData.length >= 2) {
      let increases = 0;
      let decreases = 0;
      
      for (let i = 1; i < sortedMonthlyData.length; i++) {
        const current = sortedMonthlyData[i][1];
        const previous = sortedMonthlyData[i-1][1];
        
        if (current > previous) increases++;
        else if (current < previous) decreases++;
      }
      
      if (increases > decreases) {
        summary += `Sales show an overall increasing trend. `;
      } else if (decreases > increases) {
        summary += `Sales show an overall decreasing trend. `;
      } else {
        summary += `Sales show a stable pattern without clear trending. `;
      }
    }
    
    const avgSaleAmount = totalSalesAmount / salesData.length;
    summary += `Average transaction amount: £${avgSaleAmount.toFixed(2)}. `;
    
    return summary;
  } catch (error) {
    console.error('Error summarizing sales data:', error);
    return 'Error processing sales data summary';
  }
}

export async function POST(request: Request) {
  try {
    const { description, tags, categories, resources, resourceHistory, availableResources, salesData } = await request.json();
    
    // ChatGPT API configuration
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Process resource data for the prompt
    const currentResourcesSummary = resources ? summarizeResources(resources) : 'No current resource data available';
    const resourceHistorySummary = resourceHistory ? summarizeResourceHistory(resourceHistory) : 'No historical data available';
    const availableResourcesFromOtherCharities = availableResources ? summarizeResources(availableResources) : 'No available resources data available';
    const salesSummary = salesData ? summarizeSalesData(salesData) : 'No current sales data available';

    // Format the prompt for more structured and useful predictions
    const prompt = `
      You are an AI that specializes in charity resource demand forecasting.
      Based on the following charity information, current resources and sales data predict the seasonal demand trends (monthly) for each different resource category.

      Charity Description: ${description || 'No description provided'}
      Primary Category: ${categories?.primary || 'Not specified'}
      Secondary Categories: ${categories?.secondary?.join(', ') || 'None'}
      Tags: ${tags?.join(', ') || 'None'}

      Current Resources:
      ${currentResourcesSummary}

      Resource History:
      ${resourceHistorySummary}

      Charity's sales data:
      ${salesSummary}

      Resources Available From Other Charities:
      ${availableResourcesFromOtherCharities}

      Today's Date: ${new Date().toLocaleDateString()}

      Provide a structured monthly forecast for the following resource categories:
      1. Food
      2. Clothing & Personal Items
      3. Medical & Health Supplies
      4. Housing & Homelessness

      For each month (January through December), provide CLEAR distinct numeric value representing relative demand (scale of 0-10 where 10 is peak demand).
      Consider the following factors in your prediction:
      - The charity's current resource levels and where they might be lacking
      - Historical resource usage patterns from the provided history
      - Seasonal factors like weather patterns and holidays
      - School terms/holidays in the region
      - Typical donation cycles
      - Economic patterns
      - The specific needs based on the charity's categories and tags

      Format your response as a valid JSON object like this:
      {
        "food": {
          "Jan": 8,
          "Feb": 7,
          ...and so on
        },
        "clothing": {
          "Jan": 4,
          "Feb": 7,
          ...and so on
        },
        "medical": {
          "Jan": 1,
          "Feb": 3,
          ...and so on
        },
        "housing": {
          "Jan": 9,
          "Feb": 7,
          ...and so on
        },
        "explanation": "A brief explanation of why these predictions were made, considering the charity's profile, resource levels, and seasonal factors."
        "recommendation": "A sentence recommending ONLY ONE resource from the available resources from other charities that might be able to help TODAY with the predicted demand."
        "impact": "A sentence explaining the impact this recommendation will affect this charity in the next 1 to 3 months (the one you are recommending the resources to)."
      }
    `;
    // Alternative prompt structure
    // const prompt = `
    //   You are an AI that specializes in charity resource demand forecasting.

    //   # CONTEXT
    //   Charity Details:
    //   - Description: ${description || 'No description provided'}
    //   - Primary Category: ${categories?.primary || 'Not specified'}
    //   - Secondary Categories: ${categories?.secondary?.join(', ') || 'None'}
    //   - Tags: ${tags?.join(', ') || 'None'}

    //   Current Resources Summary:
    //   ${currentResourcesSummary}

    //   Resource History Analysis:
    //   ${resourceHistorySummary}

    //   Sales Data Analysis:
    //   ${salesSummary}

    //   Available Resources From Other Charities:
    //   ${availableResourcesFromOtherCharities}

    //   Today's Date: ${new Date().toLocaleDateString()}

    //   # TASK
    //   PREDICT a monthly forecast for resource needs across key categories based on the charity's profile, historical patterns, and seasonal factors.

    //   # OUTPUT REQUIREMENTS
    //   Provide a structured monthly forecast with the following specifications:
    //   1. Include forecasts for: Food, Clothing & Personal Items, Medical & Health Supplies, and Housing & Homelessness
    //   2. Assign a precise numeric value (scale 0-10) for each month and category
    //   3. Focus on actionable insights rather than theoretical analysis
    //   4. Keep explanations concise and focused on practical implications
    //   5. Prioritize resource recommendations that address immediate needs

    //   # CONTEXTUAL FACTORS TO CONSIDER
    //   - Current inventory gaps and surpluses identified in resource summary
    //   - Seasonal variations (weather patterns, holidays, school terms)
    //   - Historical usage patterns and trends from transaction history
    //   - Local economic conditions and donation cycles
    //   - Urgency scoring based on inventory levels vs. predicted demand

    //   # RESPONSE FORMAT
    //   Return your response in this exact JSON structure with no additional text. The number of each month (January to December) should be between 0 and 10, where 0 means no need and 10 means maximum need depending on your analysis (these are labeled "x"). There should be a clear distiction between these categories:
    //   {
    //     "food": {
    //       "Jan": x,
    //       ... and so on
    //     },
    //     "clothing": {
    //       "Jan": x,
    //       ... and so on
    //     },
    //     "medical": {
    //       "Jan": x,
    //       ... and so on
    //     },
    //     "housing": {
    //       "Jan": x,
    //       ... and so on
    //     },
    //     "explanation": "A brief explanation of why these predictions were made, considering the charity's profile, resource levels, and seasonal factors.",
    //     "recommendation": "A sentence recommending ONLY ONE resource from the available resources from other charities that might be able to help TODAY with the predicted demand. Start with 'Based on the available resources...'",
    //     "impact": "A sentence explaining the impact this recommendation will affect this charity in the next 1 to 3 months (the one you are recommending the resources to)."
    //   }
    // `;

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