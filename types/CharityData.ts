interface CharityData {
  id: string;
  name: string;
  owner_id?: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  opening_hours?: Record<string, { isOpen: boolean; start: string; end: string }>;

  email?: string;
  phone_number?: string;
  website_link?: string;

  rating: number | 0;
  total_rating: number | 0;

  facebook_link?: string;
  instagram_link?: string;
  twitter_link?: string;
  src_charity_img?: string;

  category_and_tags: {primary: string; secondary: string[]; tags: string[]};
  settings: {show_phone: boolean; show_website: boolean; resource_alert: boolean; resource_request: boolean;};

  created_date?: Date;
  updated_date?: Date;

  admin_verified?: boolean;
}