interface CharityData {
  id: string;
  name?: string;
  owner_id?: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  opening_hours?: Record<string, { isOpen: boolean; start: string; end: string }>;

  email?: string;
  phone_number?: string;
  website_link?: string;

  created_date?: Date;
  updated_date?: Date;

  rating: number | 0;
  total_rating: number | 0;

  admin_verified?: boolean;
}