'use client'

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { receiveTransit } from "@/app/actions";

export default function HandleReceived({ request, resourceData } : { request: TransitData; resourceData: ResourcesData[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const resource = resourceData.find(r => r.id == request.resource_id);

  const handleSubmit = async () => {
    const response = await receiveTransit(request.id, request.quantity, resource);
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
        <Button variant="outline" className="bg-green-100 text-green-600 border-green-200 hover:bg-green-100 ml-2">
          <CheckCircle className="w-3 h-3 mr-2" />
          Confirm Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 flex flex-col">
        <DialogHeader>
          <DialogTitle>Confirm receipt of these resources?</DialogTitle>
          <DialogDescription>Confirming receipt will update your inventory and complete the transfer.</DialogDescription>
        </DialogHeader>
        <div className="ml-2 mt-2 p-3 bg-blue-50 rounded-md">
          <p className="font-medium text-gray-700">Resource details:</p>
          <p><span className="text-gray-600">Item:</span> {resource?.name}</p>
          <p><span className="text-gray-600">Quantity:</span> {request.quantity} {resource?.unit}</p>
          <p><span className="text-gray-600">Status:</span> <span className="text-blue-600 font-medium">In transit</span></p>
        </div>
        <DialogFooter className="mt-4">
          <DialogClose className="mr-3">Cancel</DialogClose>
          <Button className="bg-green-100 text-green-600 border-green-200 hover:bg-green-100" onClick={handleSubmit}>
            Confirm Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}