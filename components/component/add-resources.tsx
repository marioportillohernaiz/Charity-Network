
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function AddResources() {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Resources
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Resource</DialogTitle>
          <DialogDescription>Add a new resource to your inventory.</DialogDescription>
        </DialogHeader>
        <form>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Enter resource name" className="mb-5" />

          {/* Toggle with the items:Food,Clothing & Personal Items,Household & Shelter Supplies,Medical & Health Supplies,Office & Technology Equipment,Educational & Training Materials,Transportation & Mobility,Disaster Relief & Emergency Aid,Volunteer & Human Resources, Financial & Grant Support  */}
          <Label htmlFor="category">Category</Label>
          <Select>
            <SelectTrigger className="w-full mb-5">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="clothing">Clothing & Personal Items</SelectItem>
                <SelectItem value="household">Household</SelectItem>
                <SelectItem value="medical">Medical & Health</SelectItem>
                <SelectItem value="technology">Technology Equipment</SelectItem>
                <SelectItem value="office">Office Equipment</SelectItem>
                <SelectItem value="education">Education Materials</SelectItem>
                <SelectItem value="transport">Transportation & Mobility</SelectItem>
                <SelectItem value="emergency">Emergency Aid</SelectItem>
                <SelectItem value="volunteer">Volunteer & Human Resources</SelectItem>
                <SelectItem value="financial">Financial & Grant Support</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="grid gap-4 md:grid-cols-2 mb-5">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" required />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" required placeholder="e.g. places, boxes..." />
            </div>
          </div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" required placeholder="Add additional details" />
        </form>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}