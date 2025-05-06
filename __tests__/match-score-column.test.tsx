import { render, screen } from '@testing-library/react';
import { MatchScore } from '../components/component/match-score-column';

describe('MatchScore component', () => {
  const mockResource = {
    id: 'resource1',
    charity_id: 'charity1',
    name: 'Canned Food',
    category: 'Food',
    quantity: 100,
    quantity_reserved: 20,
    unit: 'cans',
    shareable_quantity: 50,
    description: 'Non-perishable food items',
    updated_at: new Date()
  };
  
  const mockCharity = {
    id: 'charity1',
    name: 'Food Bank',
    latitude: 51.5074,
    longitude: -0.1278,
    rating: 4.5,
    total_rating: 10,
    category_and_tags: {
      primary: 'food',
      secondary: ['humanitarian', 'community'],
      tags: ['hunger', 'nutrition']
    },
    settings: {
      show_phone: true,
      show_website: true,
      resource_alert: true,
      resource_request: true
    }
  };

  it('renders with basic props', () => {
    render(
      <MatchScore 
        resource={mockResource} 
        charity={mockCharity} 
        recommendation={null}
      />
    );
    
    const scoreElement = screen.getByText(/\d+%/);
    expect(scoreElement).toBeInTheDocument();
    
    const matchQualityElement = screen.getByText(/match$/);
    expect(matchQualityElement).toBeInTheDocument();
  });

  it('shows 100% match for recommended resources', () => {
    render(
      <MatchScore 
        resource={mockResource} 
        charity={mockCharity} 
        recommendation="Based on available resources, we recommend Canned Food which would help address immediate food security needs."
      />
    );
    
    
    expect(screen.getByText('100%')).toBeInTheDocument(); // The score should be 100%
    expect(screen.getByText('Excellent match')).toBeInTheDocument(); // It should show Excellent match
    expect(screen.getByText('AI recommended')).toBeInTheDocument(); // It should show the AI recommended badge
  });

  it('gives high score for matching primary category', () => {
    const foodResource = {
      ...mockResource,
      category: 'Food',
      name: 'Rice'
    };
    
    render(
      <MatchScore 
        resource={foodResource} 
        charity={mockCharity} 
        recommendation={null}
      />
    );
    
    const matchText = screen.getByText(/match$/);
    expect(['Excellent match', 'Good match']).toContain(matchText.textContent);
  });

  it('gives lower score for non-matching categories', () => {
    const nonMatchingResource = {
      ...mockResource,
      category: 'Office Equipment',
      name: 'Printers'
    };
    
    render(
      <MatchScore 
        resource={nonMatchingResource} 
        charity={mockCharity} 
        recommendation={null}
      />
    );
    
    const scoreElement = screen.getByText(/\d+%/);
    expect(scoreElement).toBeInTheDocument();
    expect(screen.queryByText('Excellent match')).not.toBeInTheDocument();
  });
});