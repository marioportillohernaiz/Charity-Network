interface CharityData {
  id: string;
  name?: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  opening_hours?: Record<string, { isOpen: boolean; start: string; end: string }>;

  phone_number?: string;
  website_link?: string;

  created_date?: Date;
  updated_date?: Date;

  admin_verified?: boolean;
}