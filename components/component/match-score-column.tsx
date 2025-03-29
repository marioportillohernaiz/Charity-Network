// AI Match Score Component
// This component shows a circular progress indicator with a percentage
// that represents how well each resource matches the charity's needs

interface MatchScoreProps {
  resource: ResourcesData;
  charity: CharityData;
}

export function MatchScore({ resource, charity }: MatchScoreProps) {
  // Calculate match score based on resource category and charity needs
  // This is a simplified example - in a real app, you would use more complex matching logic
  const calculateMatchScore = () => {
    // This is where your AI matching logic would go
    // For this example, we'll generate a score between 0-100 based on:
    // 1. Resource category matching charity's primary category
    // 2. Previous requests for similar resources
    // 3. Seasonal factors (e.g., winter clothing in winter)
    
    // Simulate AI scoring with a deterministic but seemingly intelligent algorithm
    let score = 50; // Base score
    
    // Category matching - increase score if resource category matches charity's primary category
    if (charity.category_and_tags?.primary && 
        resource.category.toLowerCase().includes(charity.category_and_tags.primary.toLowerCase())) {
      score += 30;
    }
    
    // Secondary category matching
    if (charity.category_and_tags?.secondary) {
      for (const tag of charity.category_and_tags.secondary) {
        if (resource.category.toLowerCase().includes(tag.toLowerCase())) {
          score += 15;
          break;
        }
      }
    }
    
    // Adjust based on resource name matches with charity tags
    if (charity.category_and_tags?.tags) {
      for (const tag of charity.category_and_tags.tags) {
        if (resource.name.toLowerCase().includes(tag.toLowerCase()) ||
            (resource.description && resource.description.toLowerCase().includes(tag.toLowerCase()))) {
          score += 10;
          break;
        }
      }
    }
    
    // Add a bit of entropy to make it look more natural
    // Using the resource ID as a seed for consistent but varied scores
    const resourceIdSum = resource.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomFactor = (resourceIdSum % 15) - 7; // -7 to +7 range
    
    score += randomFactor;
    
    // Ensure the score is between 0-100
    return Math.min(Math.max(Math.round(score), 0), 100);
  };
  
  const matchScore = calculateMatchScore();
  
  // Determine color based on match score
  const getScoreColor = () => {
    if (matchScore >= 80) return '#10B981'; // Green for excellent match
    if (matchScore >= 60) return '#3B82F6'; // Blue for good match
    if (matchScore >= 40) return '#F59E0B'; // Amber for fair match
    return '#6B7280'; // Gray for poor match
  };
  
  // Calculate circle properties
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - matchScore / 100);
  
  return (
    <div className="space-y-3">
      <div className="relative h-14 w-14 flex-shrink-0">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold">{matchScore}%</span>
        </div>
        <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke={getScoreColor()} 
            strokeWidth="4" 
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div>
        <div className="text-sm font-medium">
          {matchScore >= 80 ? 'Excellent' :
           matchScore >= 60 ? 'Good' :
           matchScore >= 40 ? 'Fair' : 'Low'} match
        </div>
      </div>
    </div>
  );
}