import { NextResponse } from 'next/server';

// Helper function to summarize current resources
function summarizeResources(resources: ResourcesData[]) {
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

// Helper function to format resource statistics
function getResourceStats(resources: ResourcesData[]) {
  if (!resources || resources.length === 0) {
    return 'No resource statistics available';
  }
  
  const totalResources = resources.length;
  const totalQuantity = resources.reduce((sum, resource) => sum + resource.quantity, 0);
  const totalShareable = resources.reduce((sum, resource) => sum + resource.shareable_quantity, 0);
  const totalReserved = resources.reduce((sum, resource) => sum + resource.quantity_reserved, 0);
  const sharingPercentage = Math.round((totalShareable / totalQuantity) * 100);
  
  const categoryCounts = resources.reduce((acc, resource) => {
    acc[resource.category] = (acc[resource.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const now = new Date();
  const expiringResources = resources.filter(resource => {
    if (!resource.expiry_date) return false;
    const expiry = new Date(resource.expiry_date);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  });
  
  let summary = `The charity manages ${totalResources} distinct resources with a total quantity of ${totalQuantity} items. `;
  summary += `${totalShareable} items (${sharingPercentage}%) are available for sharing with other charities. `;
  summary += `${totalReserved} items are currently reserved. `;
  
  if (expiringResources.length > 0) {
    summary += `${expiringResources.length} resources will expire within the next 30 days. `;
  }
  
  summary += `Resources are spread across ${Object.keys(categoryCounts).length} categories. `;
  
  return summary;
}

// Website navigation guide
const navigationGuide = {
  main: [
    { name: "Map Page", path: "/protected", locationDescription: "On the navigation bar", description: "Map page where charities and their resources can be visualised" },
    { name: "Resources Page", path: "/protected/resource-page", locationDescription: "On the navigation bar", description: "Manage your inventory, view resource statistics, and handle resource requests" },
    { name: "Request Resources", path: "/protected/request-page", locationDescription: "Inside the Resources Page, then in a button near the top labeled Requests", description: "Request resources from other charities and view AI recommendations" },
    { name: "Account Settings", path: "/protected/account-page", locationDescription: "On the navigation bar", description: "Update your profile, location, and contact information" },
  ],
  resourcePageTabs: [
    { name: "Overview", description: "View analytics and statistics about your resources" },
    { name: "Resources", description: "Manage your inventory and mark scarce resources" },
    { name: "Transits", description: "View and manage ongoing resource transfers" },
    { name: "History", description: "See past transactions and sales" }
  ]
};

export async function POST(request: Request) {
  try {
    const { messages, charityData, resourceData, availableResources } = await request.json();
    
    // API configuration
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Process charity and resource data for context
    const charityContext = charityData ? 
      `Charity Name: ${charityData.name}
      Charity Description: ${charityData.description || 'Not provided'}
      Primary Category: ${charityData.category_and_tags?.primary || 'Not specified'}
      Secondary Categories: ${charityData.category_and_tags?.secondary?.join(', ') || 'None'}
      Location: ${charityData.address || 'Not specified'}`
      : 'No charity information available';
    
    const resourceSummary = resourceData?.length > 0 ? summarizeResources(resourceData) : 'No resources data available';
    const resourceStats = resourceData?.length > 0 ? getResourceStats(resourceData) : 'No resource stats';
    const availableResourcesFromOtherCharities = availableResources ? summarizeResources(availableResources) : 'No available resources data available';

    // Format the prompt
    const systemMessage = {
      role: 'system',
      content: `
        You are an AI assistant for charity organizations, specializing in resource management, fundraising, charity operations and navigation through this platform.
      
        Today's date is ${new Date().toLocaleDateString()}.
        
        You have the following information about the charity you're assisting:
        ${charityContext}

        CURRENT RESOURCE INFORMATION:
        ${resourceStats}

        RESOURCE INVENTORY:
        ${resourceSummary}

        AVAILABLE RESOURCES TO REQUEST
        ${availableResourcesFromOtherCharities}

        WEBSITE NAVIGATION INFORMATION:
        ${JSON.stringify(navigationGuide, null, 2)}

        When responding:
        1. Respond in one short sentence as if you were having a conversation.
        2. Do not add titles or sections to your sentences.
        3. Ask a short question relating the subject of the conversation
        4. Do not use bullet points or lists or symbols such as '*' in your responses.

        As the conversation goes on, provide:
        1. Specific resource allocation and management strategies
        2. Suggest fundraising approaches tailored to their primary category
        3. Offer event planning ideas relevant to their focus areas
        4. Recommend ways to optimize resource sharing with other charities
        5. Provide insights on inventory management, especially for items nearing expiration

        IMPORTANT FORMATTING INSTRUCTIONS:
        - Use markdown formatting in your responses to improve readability
        - Keep sentences short and concise

        If you don't know the answer to a specific question, suggest general best practices that most charities could benefit from.`
    };

    // Combine system message with user history
    const combinedMessages = [systemMessage, ...messages];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: combinedMessages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'OpenAI API error' }, { status: response.status });
    }
    
    // Get the response content
    try {
      const responseText = data.choices[0].message.content;
      return NextResponse.json({ response: responseText });
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return NextResponse.json({ error: 'Failed to parse response' }, { status: 422 });
    }
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}