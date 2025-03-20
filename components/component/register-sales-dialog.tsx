"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, DollarSign, PlusCircle, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { ScrollArea } from "../ui/scrollarea"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { SubmitButton } from "../submit-button"
import { submitSales } from "@/app/actions"

const categories = ["Food","Clothing & Personal Items","Household & Shelter Supplies","Medical & Health Supplies",
  "Technology Equipment","Office Equipment","Educational Materials","Transportation & Mobility",
  "Emergency Aid","Volunteer & Human Resources","Financial & Grant Support","Other"]

export function RegisterSales() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [salesItems, setSalesItems] = useState([{ category: "", amount: 0 }])

  // Add a new sales item
  const addSalesItem = () => {
    setSalesItems([...salesItems, { category: "", amount: 0 }])
  }

  // Remove a sales item
  const removeSalesItem = (index: number) => {
    const updatedItems = [...salesItems]
    updatedItems.splice(index, 1)
    setSalesItems(updatedItems)
  }

  // Update a sales item field
  const updateSalesItem = (index: number, field: string, value: string | number) => {
    const updatedItems = [...salesItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setSalesItems(updatedItems)
  }

  // Calculate total amount
  const totalAmount = salesItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validSalesItems = salesItems.filter(item => 
      item.category && item.amount && Number(item.amount) > 0
    );
    
    if (validSalesItems.length === 0) {
      toast.error("Please add at least one valid sales item with category and amount");
      return;
    }
    
    const salesFormData = new FormData();
    salesFormData.append("sales_data", JSON.stringify(validSalesItems));
    const result = await submitSales(salesFormData);
    
    if (result.success) {
      toast.success(result.message);
      setIsDialogOpen(false);
      setSalesItems([{ category: "", amount: 0 }]);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary">
          <DollarSign className="mr-2 h-4 w-4" />
          Register Sales
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] px-4">
        <DialogHeader>
          <DialogTitle>Register Sales</DialogTitle>
          <DialogDescription>Register your sales for the day/week/month to keep track of your charity's income.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="grid flex-1 max-h-[60vh] overflow-auto px-4">
            <div className="space-y-4">
              {salesItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Sales Item {index + 1}</Label>
                        {salesItems.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeSalesItem(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-3">
                          <Label htmlFor={`category-${index}`}>Category</Label>
                          <Select
                            value={item.category}
                            onValueChange={(value) => updateSalesItem(index, "category", value)}
                          >
                            <SelectTrigger id={`category-${index}`}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`amount-${index}`}>Amount ($)</Label>
                          <Input
                            id={`amount-${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={item.amount === 0 ? "" : item.amount}
                            onChange={(e) => updateSalesItem(index, "amount", Number.parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button type="button" variant="outline" className="w-full" onClick={addSalesItem}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Another Item
              </Button>

              <div className="flex justify-between items-center py-2 font-medium">
                <span>Total Amount:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button type="button" variant="link" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <SubmitButton pendingText="Saving..." type="submit">
              Register Sales
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}