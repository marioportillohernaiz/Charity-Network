'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "../ui/scrollarea"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react";
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
        <Button className="fixed p-1 w-20 h-20 top-10 md:left-8 lg:left-8 rounded-full shadow-lg bg-primary text-white pt-1">
          <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960"  fill="#FFFFFF" className="m-0 !w-12 !h-12"><path d="M240-400h122l200-200q9-9 13.5-20.5T580-643q0-11-5-21.5T562-684l-36-38q-9-9-20-13.5t-23-4.5q-11 0-22.5 4.5T440-722L240-522v122Zm280-243-37-37 37 37ZM300-460v-38l101-101 20 18 18 20-101 101h-38Zm121-121 18 20-38-38 20 18Zm26 181h273v-80H527l-80 80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z"/></svg>
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
            <Toaster richColors expand={true} />
          </form>
        </ScrollArea>
      </DialogContent>
      <Toaster />
    </Dialog>
  )
}