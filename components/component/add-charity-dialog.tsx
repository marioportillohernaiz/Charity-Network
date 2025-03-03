'use client'

import { useState } from "react";
import { ChevronRight, Loader2, MapPin, Search, Star } from "lucide-react";
import { SubmitButton } from "../submit-button";
import { toast } from "sonner";
import { submitCharity } from "@/app/actions";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scrollarea";
import { Textarea } from "../ui/textarea";

interface CharitySearchResult {
  place_id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
}

interface CharityDetails {
  place_id: string;
  name: string;
  address: string;
  phone_number: string;
  website_link: string;
  location: {
    lat: number;
    lng: number;
  };
  opening_hours: Record<string, { isOpen: boolean; start: string; end: string }>;
  rating?: number;
  description?: string;
}

export default function AddCharityDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CharitySearchResult[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<CharityDetails | null>(null);
  const [description, setDescription] = useState("");
  const [starRating, setStarRating] = useState({rating: 0});
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleRatingChange = (rating: number) => {
    setStarRating((prev) => ({ ...prev, rating }))
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchResults([]);
    setSelectedCharity(null);
    setSearchError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      
      if (data.error) {
        setSearchError(data.error);
      } else if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
      } else {
        setSearchError("No charities found. Try a different search term.");
      }
    } catch (error) {
      setSearchError("Error connecting to search service. Please try again later.");
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCharity = async (placeId: string) => {
    setSelectedCharity(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place_id: placeId }),
      });

      const data = await response.json();
      
      if (data.error) {
        setSearchError(data.error);
      } else {
        setSelectedCharity(data);
        // Start with empty description
        setDescription("");
      }
    } catch (error) {
      setSearchError("Error fetching charity details. Please try again later.");
      console.error("Details error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCharity) return;

    const charityFormData = new FormData();
    charityFormData.append("name", selectedCharity.name);
    charityFormData.append("description", description);
    charityFormData.append("address", selectedCharity.address);
    charityFormData.append("longitude", selectedCharity.location.lng.toString());
    charityFormData.append("latitude", selectedCharity.location.lat.toString());
    charityFormData.append("openingHours", JSON.stringify(selectedCharity.opening_hours));
    charityFormData.append("starRating", starRating.rating.toString());
    charityFormData.append("email", "");  // These could be populated if available
    charityFormData.append("phone", selectedCharity.phone_number || "");
    charityFormData.append("website", selectedCharity.website_link || "");

    const newCharity = await submitCharity(charityFormData);
    if (newCharity.success) {
      toast.success(newCharity.message);
      setIsDialogOpen(false);
    } else {
      toast.error(newCharity.message);
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed w-20 h-20 bottom-10 right-10 rounded-full shadow-xl bg-primary text-white text-6xl pt-0"
          onClick={() => setIsDialogOpen(true)}
        >+</Button>
      </DialogTrigger>
      <DialogContent className="p-6 flex flex-col">
        <DialogHeader>
          <DialogTitle>Search and Add Charity</DialogTitle>
        </DialogHeader>
        
        <div className="m-2">
          <Label htmlFor="search">Search for a charity using the Places API</Label>
          <div className="flex space-x-2 mt-2">
            <Input 
              id="search" 
              name="search" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Food bank Oxford, UK"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button size="icon" type="button" onClick={handleSearch}>
              {loading && !selectedCharity ? (
                <Loader2 className="h-6 w-6 animate-spin" /> 
              ) : (
                <Search />
              )}
            </Button>
          </div>
        </div>

        {searchError && <p className="text-destructive text-sm mx-2">{searchError}</p>}

        {searchResults.length > 0 && !selectedCharity && (
          <ScrollArea className="grid gap-1 flex-1 max-h-[40vh] overflow-auto mt-4">
            <p className="text-muted-foreground text-sm mb-2 ml-2">Select a charity from the results:</p>
            {searchResults.map((result) => (
              <Button 
                key={result.place_id}
                variant="outline" 
                className="flex flex-col items-start p-3 mb-2 h-auto gap-1 w-full"
                onClick={() => handleSelectCharity(result.place_id)}
              >
                <div className="flex justify-between w-full">
                  <span className="font-medium">{result.name}</span>
                  {result.rating && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm">{result.rating}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{result.address}</span>
                </div>
              </Button>
            ))}
          </ScrollArea>
        )}

        {selectedCharity && (
          <>
            <ScrollArea className="grid gap-1 flex-1 max-h-[60vh] overflow-auto">
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
                
                <div className="grid m-2 my-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={selectedCharity.name} readOnly />
                </div>
                <div className="grid m-2 my-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description of this charity"
                  />
                </div>
                <div className="grid m-2 my-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={selectedCharity.address} readOnly />
                </div>
                <div className="grid m-2 my-2">
                  <Label htmlFor="phone">Phone Number:</Label>
                  <Input id="phone" name="phone" value={selectedCharity.phone_number || "Not available"} readOnly />
                </div>
                <div className="grid m-2 my-2">
                  <Label htmlFor="website">Website:</Label>
                  <Input id="website" name="website" value={selectedCharity.website_link || "Not available"} readOnly />
                </div>
                
                <div className="grid m-2 my-2">
                  <Label>Opening Hours:</Label>
                  <div className="border rounded-md p-3 mt-1 text-sm">
                    {Object.entries(selectedCharity.opening_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between py-1 border-b last:border-0">
                        <span className="font-medium">{day}</span>
                        <span>{hours.isOpen ? `${hours.start} - ${hours.end}` : "Closed"}</span>
                      </div>
                    ))}
                  </div>
                </div>
            </ScrollArea>
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setSelectedCharity(null)}>
                Back to Search
              </Button>
              <Button type="button" onClick={handleSubmit}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Submit Charity
              </Button>
            </DialogFooter>
          </>
        )}

        {!selectedCharity && searchResults.length === 0 && (
          <div className="text-center p-6 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Search for a charity to add it to the map</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}