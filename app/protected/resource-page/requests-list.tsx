"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface RequestsListProps {
  limit?: number
}

const requests = [
  {
    id: "1",
    charity: "Hope Foundation",
    resource: "Winter Coats",
    quantity: 50,
    urgency: "High",
    status: "Pending",
    date: "2024-02-22",
  },
  {
    id: "2",
    charity: "Care Center",
    resource: "Canned Food",
    quantity: 200,
    urgency: "Medium",
    status: "Approved",
    date: "2024-02-21",
  },
  {
    id: "3",
    charity: "Help Network",
    resource: "Medical Supplies",
    quantity: 30,
    urgency: "High",
    status: "Pending",
    date: "2024-02-20",
  },
  {
    id: "4",
    charity: "Education First",
    resource: "School Supplies",
    quantity: 100,
    urgency: "Low",
    status: "Completed",
    date: "2024-02-19",
  },
  {
    id: "5",
    charity: "Community Aid",
    resource: "Hygiene Kits",
    quantity: 75,
    urgency: "Medium",
    status: "Pending",
    date: "2024-02-18",
  },
]

export default function RequestsList({ limit }: RequestsListProps) {
  const displayRequests = limit ? requests.slice(0, limit) : requests

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Charity</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Urgency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.charity}</TableCell>
              <TableCell>{request.resource}</TableCell>
              <TableCell>{request.quantity}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.urgency === "High" ? "destructive" : request.urgency === "Medium" ? "default" : "secondary"
                  }
                >
                  {request.urgency}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    request.status === "Completed" ? "default" : request.status === "Approved" ? "secondary" : "outline"
                  }
                >
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell>{request.date}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" className="w-[100px]">
                  {request.status === "Pending" ? "Review" : "View"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

