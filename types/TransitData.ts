interface TransitData {
  id: string;
  resource_id: string;
  resource_name: string;
  charity_from: string;
  charity_to: string;
  quantity: number;
  status: string;
  description: string;
  time_sent?: Date;
  time_recieved?: Date;
  updated_at: Date;
}