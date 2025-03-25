interface Sales {
  id: string;
  charity_id: string;
  sales_data?: [{ category: string; amount: number }];
  date_from: Date;
  date_to: Date;
  created_at: Date;
}