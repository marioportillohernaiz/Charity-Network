'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "../ui/scrollarea"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquarePlus, Star } from "lucide-react";
import { toast, Toaster } from "sonner";
import { SubmitButton } from "../submit-button";
import { submitReview } from "@/app/actions";

export default function AddCharityReviewDialog({ selectedCharityId } : { selectedCharityId: string; }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [starRating, setStarRating] = useState(0);
  const [commentText, setCommentText] = useState("");

  const handleSubmit = async () => {
    const reviewFormData = new FormData();
    reviewFormData.append("charityId", selectedCharityId);
    reviewFormData.append("starRating", starRating.toString());
    reviewFormData.append("commentText", commentText);

    const reviewResponse = await submitReview(reviewFormData);
    if (reviewResponse.success) {
      toast.success(reviewResponse.message);
      setTimeout(() => {
        setIsDialogOpen(false);
      }, 2000);
    } else {
      toast.error(reviewResponse.message);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          Add Review
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Review</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-auto w-full">
          <form className="grid gap-1">
            <div className="flex pt-2">
              <Label className="m-2">Rating</Label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" className="focus:outline-none" onClick={() => setStarRating(star)}>
                    <Star
                      className={`w-6 h-6 ${
                        starRating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="m-2"> 
              <Label htmlFor="comments">Comment</Label>
              <Textarea id="comments" name="comments" value={commentText} onChange={(e) => setCommentText(e.target.value)}/>
            </div>
          
            <SubmitButton pendingText="Adding Review..." type="submit" formAction={handleSubmit}>Add Review</SubmitButton>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}