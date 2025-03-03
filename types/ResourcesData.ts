interface ResourcesData {
  id: string;
  charity_id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  quantity_reserved: number;
  unit: string;
  shareable_quantity: number;
  location?: string;
  expiry_date?: Date;
  updated_at: Date;
}