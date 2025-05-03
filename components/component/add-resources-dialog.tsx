
"use client"

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AlertCircle, Edit, Info, Plus } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { format } from "date-fns";
import React from "react";
import { toast } from "sonner";
import { submitResource } from "@/app/actions";
import { ScrollArea } from "../ui/scrollarea";
import { SubmitButton } from "../ui/submit-button";

export function AddResources({resource, action} : {resource: ResourcesData | null; action: string;}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState(resource?.name || "");
  const [category, setCategory] = useState(resource?.category || "");
  const [quantity, setQuantity] = useState(resource?.quantity || 0);
  const [reservedQuantity, setReservedQuantity] = useState(resource?.quantity_reserved || 0);
  const [unit, setUnit] = useState(resource?.unit ||"");
  const [storage, setStorage] = useState(resource?.location || "");
  const [description, setDescription] = useState(resource?.description ||"");
  const [date, setDate] = React.useState<Date | undefined>(resource?.expiry_date || new Date());
  const [canExpire, setCanExpire] = useState(resource?.expiry_date ? true : false);
  const [isShareable, setIsShareable] = useState(resource?.shareable_quantity ? (resource?.shareable_quantity > 0 ? true : false) : false);
  const [shareableQuantity, setShareableQuantity] = useState(resource?.shareable_quantity || 0);
  const isUpdate = action === "restock" || action === "editrow";

  const handleSubmit = async () => {
    const resourceData = new FormData();
    resourceData.append("id", resource?.id || "");
    resourceData.append("name", name);
    resourceData.append("description", description || "");
    resourceData.append("category", category);
    resourceData.append("quantity", quantity.toString() || "0");
    resourceData.append("reservedQuantity", reservedQuantity.toString()  || "0");
    resourceData.append("unit", unit.toString());
    resourceData.append("shareableQuantity", isShareable ? shareableQuantity.toString() : "0");
    resourceData.append("location", storage || "");
    resourceData.append("expiryDate", canExpire ? (date?.toString() || "") : "");

    if (reservedQuantity + shareableQuantity > quantity) {
      toast.error("You cannot have negative quantity");
    } else {
      const newResource = await submitResource(resourceData);
      if (newResource.success) {
        toast.success(newResource.message);
        setIsDialogOpen(false);
      } else {
        toast.error(newResource.message);
      }
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {action == "editrow" &&
        <DialogTrigger asChild><Button type="button" variant="ghost"><Edit className="mr-2 h-4 w-4" /></Button></DialogTrigger>
      }
      {action == "add" &&
        <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Resources</Button></DialogTrigger>
      }
      {action == "restock" &&
        <DialogTrigger asChild><Button variant="outline" size="sm">Restock</Button></DialogTrigger>
      }
      <DialogContent className="sm:max-w-[600px] px-4">
        <DialogHeader>
          <DialogTitle>{resource ? "Update Resources" : "Add Resource"}</DialogTitle>
          <DialogDescription>{resource ? "Update" : "Add"} a resource to your inventory with detailed information.</DialogDescription>
        </DialogHeader>
        <form>
        <ScrollArea className="grid flex-1 max-h-[60vh] overflow-auto px-4">
          {!isUpdate && <div className="py-2">
            <Label htmlFor="name" className="font-medium">
              Resource Name <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="name" 
              name="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter resource name" 
              required
            />
          </div>}

          {!isUpdate && <div className="py-2">
            <Label htmlFor="category" className="font-medium">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select 
              name="category" 
              value={category} 
              onValueChange={(value) => setCategory(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Clothing & Personal Items">Clothing & Personal Items</SelectItem>
                  <SelectItem value="Household & Shelter Supplies">Household & Shelter Supplies</SelectItem>
                  <SelectItem value="Medical & Health Supplies">Medical & Health Supplies</SelectItem>
                  <SelectItem value="Technology Equipment">Technology Equipment</SelectItem>
                  <SelectItem value="Office Equipment">Office Equipment</SelectItem>
                  <SelectItem value="Educational Materials">Educational Materials</SelectItem>
                  <SelectItem value="Transportation & Mobility">Transportation & Mobility</SelectItem>
                  <SelectItem value="Emergency Aid">Emergency Aid</SelectItem>
                  <SelectItem value="Volunteer & Human Resources">Volunteer & Human Resources</SelectItem>
                  <SelectItem value="Financial & Grant Support">Financial & Grant Support</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>}

          <div className="grid gap-4 md:grid-cols-2 py-2">
            <div className="space-y-1">
              <div className="flex items-center">
                <Label htmlFor="quantity" className="font-medium">
                  Total Quantity <span className="text-red-500">*</span>
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Total number of items being added to inventory</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                id="quantity" 
                name="quantity" 
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center">
                <Label htmlFor="quantity_reserved" className="font-medium">
                  Reserved Quantity
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 ml-1 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Number of items reserved and not available for sharing</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input 
                id="quantity_reserved" 
                name="quantity_reserved" 
                type="number"
                value={reservedQuantity}
                onChange={(e) => setReservedQuantity(Number(e.target.value))}
                min="0"
                max={(quantity - shareableQuantity) || 0}
              />
              <p className="text-xs text-gray-500">
                Maximum available: {quantity - shareableQuantity - reservedQuantity} {unit}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 py-2">
            <div className="space-y-1">
              <Label htmlFor="unit" className="font-medium">
                Unit <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="unit" 
                name="unit" 
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. items, boxes, kg, hours..."
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="location" className="font-medium">
                Storage Location
              </Label>
              <Input 
                id="location" 
                name="location" 
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                placeholder="Where is this resource stored?" 
              />
            </div>
          </div>

          

          <div className="grid gap-4 md:grid-cols-2 py-2">
            <div className="grid grid-cols-4">
              <div className="col-span-3">
                <Label htmlFor="expiry_date" className="font-medium">
                  Expiry Date
                </Label>
                <p className="text-xs text-gray-500 pr-2">Only for items with a limited shelf life</p>
              </div>
              <Switch 
                className="my-auto"
                id="canExpire" 
                checked={canExpire}
                onCheckedChange={(checked) => setCanExpire(checked)}
              />
            </div>
            {canExpire && (
              <div className="space-y-1">
                <Label htmlFor="expiry_date" className="text-xs text-gray-500">
                  Expiry Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!date ? "text-muted-foreground" : ""}`}
                    >
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={undefined}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {!isUpdate && <div className="py-2">
            <Label htmlFor="description" className="font-medium">
              Description
            </Label>
            <Textarea 
              id="description" 
              name="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add additional details about this resource..." 
              rows={3}
            />
          </div>}

          <div className="py-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="isShareable" 
                checked={isShareable}
                onCheckedChange={(checked) => setIsShareable(checked)}
              />
              <div>
                <Label htmlFor="isShareable" className="font-medium">
                  Available for sharing with other charities
                </Label>
                <p className="text-sm text-gray-500">
                  This resource will be visible to other charities in the network
                </p>
              </div>
            </div>

            {isShareable && (
              <div className="pt-3">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <Label htmlFor="shareable_quantity" className="font-medium">
                      Quantity Available for Sharing
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-1 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-60">Number of items you're making available for other charities to request</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input 
                    id="shareable_quantity" 
                    name="shareable_quantity" 
                    type="number"
                    value={shareableQuantity}
                    onChange={(e) => setShareableQuantity(Number(e.target.value))}
                    min="0"
                    max={(quantity - reservedQuantity) || 0}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Maximum available: {quantity - reservedQuantity - shareableQuantity} {unit}
                  </p>
                </div>
              </div>
            )}
          </div>

          {isShareable && (
            <div className="bg-blue-50 my-3 p-3 rounded-md border border-blue-100 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Important Note</p>
                <p>Resources marked as shareable can be requested by other charities in your network. You'll receive notifications when a request is made.</p>
              </div>
            </div>
          )}
        </ScrollArea>
        <DialogFooter className="gap-2 sm:gap-0 mt-4 ">
          {resource ? (
            <Button type="button" variant="link" className="text-red-500" onClick={() => setIsDialogOpen(false)}>
              Delete Resource
            </Button>
          ) : (null)}
          <Button type="button" variant="link" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button> 
          <SubmitButton pendingText="Saving..." type="submit" onClick={handleSubmit}>
            {resource ? "Update Resource" : "Add Resource"}
          </SubmitButton>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}