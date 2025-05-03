// Allows users to add a charities by scraping the website for information

// NOT IN USE due to website restrictions on scraping (e.g. bot protection, rate-limiting, or terms of service) 

'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "../ui/scrollarea"
import { ChevronRight, Loader2, Star } from "lucide-react";
import { SubmitButton } from "../ui/submit-button";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { submitCharity } from "@/app/actions";

export default function AddCharityDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [website, setWebsite] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [starRating, setStarRating] = useState({rating: 0});
  const handleRatingChange = (rating: number) => {
    setStarRating((prev) => ({ ...prev, rating }))
  };

  const [webLinkAdded, setWebLinkAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [websiteError, setWebsiteError] = useState("");

  const handleWebScrape = async (event: React.FormEvent) => {
    if (!website) return;
    setName("");
    setDescription("");
    setPhone("");
    setEmail("");
    setWebsiteError("");

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: website }),
      });

      const data = await response.json();

      console.log(data.opening_hours);
      
      if (data.error) {
        setWebsiteError("Error: Cannot fetch data.");
        setWebLinkAdded(false);
      } else if (data) {
        setWebLinkAdded(true);
        data.title && setName(data.title);
        data.description && setDescription(data.description);
        data.phone && setPhone(data.phone);
        data.email && setEmail(data.email);
      } else {
        setWebsiteError("Error: Cannot fetch data.");
      }
      setLoading(false);
    } catch (error) {
      setWebsiteError("Error: " + error);
      setWebLinkAdded(false);
      setLoading(false);
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const address_number = form.elements.namedItem('address_number') as HTMLTextAreaElement;
    const address_street = form.elements.namedItem('address_street') as HTMLTextAreaElement;
    const address_city = form.elements.namedItem('address_city') as HTMLTextAreaElement;
    const address_postcode = form.elements.namedItem('address_postcode') as HTMLTextAreaElement;
    const address = [address_number.value.trim(), address_street.value.trim(), address_city.value.trim(), address_postcode.value.trim()].join(", ");

    const charityFormData = new FormData();
    charityFormData.append("name", name);
    charityFormData.append("description", description);
    charityFormData.append("address", address);

    charityFormData.append("starRating", starRating.rating.toString());

    charityFormData.append("email", email);
    charityFormData.append("phone", phone);
    charityFormData.append("website", website);

    const newEatery = await submitCharity(charityFormData);
    if (newEatery.success) {
      toast.success(newEatery.message);
    } else {
      toast.error(newEatery.message);
    }

    setIsDialogOpen(false);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-11 h-11 rounded-full shadow-xl bg-primary text-white text-5xl pt-1"
          onClick={() => setIsDialogOpen(true)}
        >+</Button>
      </DialogTrigger>
      <DialogContent className="p-6 flex flex-col">
        <DialogHeader>
          <DialogTitle>Request to Add Location</DialogTitle>
        </DialogHeader>
        
        <div className="m-2">
          <Label htmlFor="website">Enter Website Link</Label>
          <div className="flex space-x-2 mt-2">
            <Input id="website" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            <Button size="icon" type="button" onClick={handleWebScrape}>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" /> 
              ) : (
                <ChevronRight />
              )}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          {webLinkAdded ? (
            <>
            <ScrollArea className="grid gap-1 flex-1 max-h-[60vh] overflow-auto ">
                <div className="flex">
                  <Label className="m-2">Rate the Charity:</Label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" className="focus:outline-none" onClick={() => handleRatingChange(star)}>
                        <Star
                          className={`w-6 h-6 ${
                            starRating.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-gray-400 italic mt-2">*Please check the fields are correct:</p>
                <div className="grid m-2 my-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name not found"/>
                </div>
                <div className="grid m-2 my-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description not found"/>
                </div>
                <div className="grid m-2 my-2">
                  <Label htmlFor="address">Full Address (enter manually)</Label>
                  <div className="grid grid-cols-4 grid-rows-2 gap-2">
                    <Input id="address_number" name="address_number" placeholder="Building Numb." required />
                    <Input className="col-span-3" id="address_street" name="address_street" placeholder="Street Name" required />
                    <Input className="col-span-2" id="address_city" name="address_city" placeholder="City" required />
                    <Input className="col-span-2" id="address_postcode" name="address_postcode" placeholder="Post Code" required />
                  </div>
                </div>
                <div className="grid m-2 my-2">
                  <Label htmlFor="phone">Phone Number:</Label>
                  <Input id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone not found"/>
                </div>
                <div className="grid m-2 my-2">
                  <Label htmlFor="email">Email:</Label>
                  <Input id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email not found"/>
                </div>
                
            </ScrollArea>
            </>
          ) : null}
          <DialogFooter className="mt-2 !flex !justify-between">
            <p className="text-red-500 mt-2">{websiteError}</p>
            <SubmitButton pendingText="Sending Request..." type="submit" disabled={!webLinkAdded}>Send Request</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}