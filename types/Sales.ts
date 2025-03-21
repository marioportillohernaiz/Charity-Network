interface Sales {
  id: string;
  charity_id: string;
  date: Date;
  sales_data?: [{ category: string; amount: number }];
}