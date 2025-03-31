'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import { requestResource } from "@/app/actions";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";

export default function RequestResource({ selectedResource, className } : { selectedResource: ResourcesData; className: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    const response = await requestResource(selectedResource, requestQuantity, notes);
    if (response.success) {
      toast.success(response.message);
      setIsDialogOpen(false);
    } else {
      toast.error(response.message);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Resource</DialogTitle>
          <DialogDescription>
            Specify how many units you would like to request.
          </DialogDescription>
        </DialogHeader>
        
        {selectedResource && (
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium mb-1">{selectedResource.name}</h4>
                  <Badge variant="outline">{selectedResource.category}</Badge>
                </div>

                <div>
                  <label className="text-sm font-medium">Available</label>
                  <p>{selectedResource.shareable_quantity} {selectedResource.unit}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Request Quantity</label>
                <div className="w-full">
                  <Slider
                    id="quantity"
                    min={1}
                    max={selectedResource?.shareable_quantity || 1}
                    step={1}
                    value={[requestQuantity]}
                    onValueChange={(value) => setRequestQuantity(value[0])}
                    className="my-2"
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      {requestQuantity} {selectedResource?.unit}
                    </p>
                    <p className="text-xs text-gray-500">
                      Max: {selectedResource?.shareable_quantity} {selectedResource?.unit}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Reason for Request</label>
                <Textarea 
                  placeholder="Add a note to the charity (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox id="terms" />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I confirm this request is for charitable purposes
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Your organization will be responsible for arranging pickup or delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="link" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}