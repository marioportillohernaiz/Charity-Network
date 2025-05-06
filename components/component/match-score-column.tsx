// MATCH SCORE COMPONENT

export function MatchScore({ resource, charity, recommendation } : {resource: ResourcesData; charity: CharityData; recommendation: string | null}) {
  // Calculate match score based on resource category, charity needs, and AI recommendation
  const calculateMatchScore = () => {
    // Start with base scoring logic
    let score = 40;
    
    // Category matching - increase score if resource category matches charity's primary category
    if (charity.category_and_tags?.primary && 
        resource.category.toLowerCase().includes(charity.category_and_tags.primary.toLowerCase())) {
      score += 50;
    }
    
    // Secondary category matching
    if (charity.category_and_tags?.secondary) {
      for (const tag of charity.category_and_tags.secondary) {
        if (resource.category.toLowerCase().includes(tag.toLowerCase())) {
          score += 30;
          break;
        }
      }
    }
    
    // Adjust based on resource name matches with charity tags
    if (charity.category_and_tags?.tags) {
      for (const tag of charity.category_and_tags.tags) {
        if (resource.name.toLowerCase().includes(tag.toLowerCase()) ||
            (resource.description && resource.description.toLowerCase().includes(tag.toLowerCase()))) {
          score += 20;
          break;
        }
      }
    }
    
    // Check if the resource name appears in the recommendation string
    if (recommendation) {
      const resourceNameLower = resource.name.toLowerCase();
      const recommendationLower = recommendation.toLowerCase();
      
      // If the resource name appears in the recommendation string, return 100%
      if (recommendationLower.includes(resourceNameLower)) {
        return 100;
      }
      
      // Check for partial matches or similar resources mentioned
      const resourceKeywords = resourceNameLower.split(' ');
      for (const keyword of resourceKeywords) {
        // Skip very short or common words
        if (keyword.length > 3 && !['and', 'the', 'for', 'from', 'with'].includes(keyword)) {
          if (recommendationLower.includes(keyword)) {
            score += 30;
            break;
          }
        }
      }
      
      // Check for category mentions in the recommendation
      if (recommendationLower.includes(resource.category.toLowerCase())) {
        score += 30;
      }
    }
    
    return Math.min(Math.max(Math.round(score), 0), 100);
  };
  
  const matchScore = calculateMatchScore();
  const getScoreColor = () => {
    if (matchScore >= 80) return '#10B981';
    if (matchScore >= 60) return '#3B82F6';
    if (matchScore >= 40) return '#F59E0B';
    return '#6B7280';
  };
  
  // Calculate circle properties
  const circumference = 2 * Math.PI * 16;
  
  return (
    <div className="flex items-center justify-center">
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
            strokeDasharray={2 * Math.PI * 16}
            strokeDashoffset={circumference * (1 - matchScore / 100)}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="pl-2">
        <div className="text-sm text-center font-medium">
          {matchScore >= 80 ? 'Excellent' :
           matchScore >= 60 ? 'Good' :
           matchScore >= 40 ? 'Fair' : 'Low'} match
        </div>
        {matchScore === 100 && recommendation && (
          <div className="text-xs text-center text-green-600 mt-1 font-medium">AI recommended</div>
        )}
      </div>
    </div>
  );
}