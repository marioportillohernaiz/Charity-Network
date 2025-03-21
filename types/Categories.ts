export interface Category {
  value: string;
  label: string;
}

export const PRIMARY_CATEGORIES: Category[] = [
  { value: "health", label: "Health & Medical" },
  { value: "education", label: "Education" },
  { value: "welfare", label: "Environment and Animal Welfare" },
  { value: "housing", label: "Housing & Homelessness" },
  { value: "food", label: "Food Services" },
  { value: "humanitarian", label: "Humanitarian Services" },
  { value: "arts", label: "Arts & Culture" },
  { value: "community", label: "Community Development" },
  { value: "religious", label: "Religious" },
  { value: "other", label: "Other" }
];

export const SECONDARY_CATEGORIES = [
  "Children & Youth", "Elderly", "Disabled", "Mental Health", 
  "Crisis Relief", "Food Security", "Education", "Research",
  "Advocacy", "Conservation", "Sports & Recreation", "International"
];


export const RESOURCE_CATEGORIES = ["All", "Food","Clothing & Personal Items",
  "Household & Shelter Supplies","Medical & Health Supplies","Technology Equipment",
  "Office Equipment","Educational Materials","Transportation & Mobility",
  "Emergency Aid","Volunteer & Human Resources","Financial & Grant Support","Other"]

export const RESOURCE_CATEGORIES_MAP: Category[] = [
  { value: "food", label: "Food" },
  { value: "clothing", label: "Clothing & Personal Items" },
  { value: "medical", label: "Medical & Health Supplies" },
  { value: "housing", label: "Housing & Homelessness" },
  { value: "tech", label: "Technology Equipment" },
  { value: "office", label: "Office Equipment" },
  { value: "education", label: "Educational Materials" },
  { value: "transport", label: "Transportation & Mobility" },
  { value: "volunteer", label: "Volunteer & Human Resources" },
  { value: "finance", label: "Financial & Grant Support" },
  { value: "other", label: "Other" }
];