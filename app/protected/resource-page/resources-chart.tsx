"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    category: "Food",
    total: 652,
  },
  {
    category: "Clothing",
    total: 234,
  },
  {
    category: "Medical",
    total: 156,
  },
  {
    category: "Education",
    total: 98,
  },
  {
    category: "Hygiene",
    total: 94,
  },
]

export default function ResourcesChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}

