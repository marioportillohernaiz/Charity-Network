'use client'

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PackageCheck } from "lucide-react";
import { dispatchTransit } from "@/app/actions";
import { toast } from "sonner";

export default function HandleDispatch({ request, resourceData } : { request: TransitData; resourceData: ResourcesData[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const resource = resourceData.find(r => r.id == request.resource_id);

  const handleSubmit = async () => {
    const response = await dispatchTransit(request.id, resource);
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
          <PackageCheck className="w-5 h-5 mr-2" />
          Dispatch
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 flex flex-col">
        <DialogHeader>
          <DialogTitle>Are you sure you want to dispatch these resources?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <div className="ml-2">
          <p>Items: {resource?.name}</p>
          <p>Quantity: {request.quantity} {resource?.unit}</p>
        </div>
        <DialogFooter>
          <DialogClose className="mr-3">Cancel</DialogClose>
          <Button className="bg-green-100 text-green-600 border-green-200 hover:bg-green-100" onClick={handleSubmit}>Dispatch</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}