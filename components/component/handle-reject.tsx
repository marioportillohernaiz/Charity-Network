'use client'

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CircleX } from "lucide-react";
import { rejectTransit } from "@/app/actions";
import { toast } from "sonner";
import { SubmitButton } from "../ui/submit-button";
import { TransitStatus } from "@/types/TransitStatus";

export default function HandleReject({ request, resourceData } : { request: TransitData; resourceData: ResourcesData[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const resource = resourceData.find(r => r.id == request.resource_id);

  const handleSubmit = async () => {
    const response = await rejectTransit(request.id, TransitStatus.REJECTED);
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
        <Button variant="outline" className="bg-red-100 text-red-800 border-red-200">
          <CircleX className="w-4 h-4 mr-2" />
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 flex flex-col">
        <DialogHeader>
          <DialogTitle>Are you sure you want to reject this transit?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <div className="ml-2">
          <p>Items: {resource?.name}</p>
          <p>Quantity: {request.quantity} {resource?.unit}</p>
        </div>
        <DialogFooter>
          <DialogClose className="mr-3">Cancel</DialogClose>
          <SubmitButton pendingText="Rejecting..." variant="destructive" onClick={handleSubmit}>Reject</SubmitButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}