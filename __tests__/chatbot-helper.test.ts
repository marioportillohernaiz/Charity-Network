// Extract these functions from api/chatbot/route.ts
function summarizeResources(resources: ResourcesData[]) {
  if (!resources || resources.length === 0) {
    return 'No resource summary available';
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

describe('Chatbot helper functions', () => {
  const mockResources = [
    {
      id: '1',
      charity_id: 'charity1',
      name: 'Food Cans',
      category: 'Food',
      quantity: 100,
      quantity_reserved: 20,
      unit: 'cans',
      shareable_quantity: 50,
      expiry_date: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days in future
      updated_at: new Date()
    },
    {
      id: '2',
      charity_id: 'charity1',
      name: 'Blankets',
      category: 'Clothing & Personal Items',
      quantity: 30,
      quantity_reserved: 5,
      unit: 'items',
      shareable_quantity: 10,
      updated_at: new Date()
    },
    {
      id: '3',
      charity_id: 'charity1',
      name: 'Pasta',
      category: 'Food',
      quantity: 50,
      quantity_reserved: 0,
      unit: 'kg',
      shareable_quantity: 25,
      updated_at: new Date()
    }
  ];

  it('summarizes resources correctly', () => {
    const summary = summarizeResources(mockResources);
    
    expect(summary).toContain('- Food: 150 total items');
    expect(summary).toContain('Top items: Food Cans (100 cans), Pasta (50 kg)');
    expect(summary).toContain('- Clothing & Personal Items: 30 total items');
    expect(summary).toContain('Top items: Blankets (30 items)');
  });

  it('returns appropriate message for empty resources', () => {
    expect(summarizeResources([])).toBe('No resource summary available');
  });

  it('generates resource statistics correctly', () => {
    const stats = getResourceStats(mockResources);
    
    expect(stats).toContain('manages 3 distinct resources with a total quantity of 180 items');
    expect(stats).toContain('85 items (47%) are available for sharing');
    expect(stats).toContain('25 items are currently reserved');
    expect(stats).toContain('1 resources will expire within the next 30 days');
    expect(stats).toContain('Resources are spread across 2 categories');
  });

  it('returns appropriate message for empty statistics', () => {
    expect(getResourceStats([])).toBe('No resource statistics available');
  });
});