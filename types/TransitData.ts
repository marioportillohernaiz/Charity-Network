interface TransitData {
  id: string;
  resource_id: string;
  charity_from: string;
  charity_to: string;
  quantity: number;
  status: string;
  description: string;
  can_expire: boolean;
  time_sent?: Date;
  time_received?: Date;
  updated_at: Date;
}