"use client"

import { useState } from "react"
import { ArrowUpDown, MoreHorizontal, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const resources = [
  {
    id: "1",
    name: "Canned Food",
    category: "Food",
    quantity: 500,
    unit: "cans",
    lastUpdated: "2024-02-22",
  },
  {
    id: "2",
    name: "Winter Coats",
    category: "Clothing",
    quantity: 100,
    unit: "pieces",
    lastUpdated: "2024-02-21",
  },
  {
    id: "3",
    name: "First Aid Kits",
    category: "Medical",
    quantity: 50,
    unit: "kits",
    lastUpdated: "2024-02-20",
  },
  {
    id: "4",
    name: "School Supplies",
    category: "Education",
    quantity: 200,
    unit: "sets",
    lastUpdated: "2024-02-19",
  },
  {
    id: "5",
    name: "Hygiene Kits",
    category: "Hygiene",
    quantity: 150,
    unit: "kits",
    lastUpdated: "2024-02-18",
  },
]

export default function ResourcesList() {
  const [sorting, setSorting] = useState<{
    column: string | null
    direction: "asc" | "desc"
  }>({
    column: null,
    direction: "asc",
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input placeholder="Filter resources..." className="max-w-sm" />
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Resource
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent">
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell className="font-medium">{resource.name}</TableCell>
                <TableCell>{resource.category}</TableCell>
                <TableCell>{resource.quantity}</TableCell>
                <TableCell>{resource.unit}</TableCell>
                <TableCell>{resource.lastUpdated}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit Resource</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete Resource</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

