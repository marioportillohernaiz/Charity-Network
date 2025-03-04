'use client'

import { useEffect, useRef, useState } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Clock, Globe, MapPin, Phone, Star, StarHalf } from "lucide-react";
import { format } from "date-fns";
import { Toaster } from "sonner";
import L from "leaflet";
import AddCharityDialog from "@/components/component/add-charity-dialog";
import AddCharityReviewDialog from "@/components/component/add-review-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";


export default function Map({ charitiesData, currentCharity, commentsData }: { charitiesData: CharityData[]; currentCharity: CharityData; commentsData: ReviewComments[]; })  {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedCharity, setSelectedCharity] = useState<CharityData | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current).setView([52.7721, -1.2062], 15);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const customIcon = L.icon({
      iconUrl: "/pin.png",
      iconSize: [25, 35],
      iconAnchor: [16, 40],
    });

    if (charitiesData) {
      charitiesData
      .filter((charity) => charity.admin_verified)
      .forEach((charity) => {
        const marker = L.marker([charity.latitude, charity.longitude], { icon: customIcon }).addTo(map);

        const formatName = (name: string | undefined) => {
          return name?.replace(/(.{20})/g, '$1<br>');
        };
        
        const getTooltipHeight = (name: string | undefined) => {
          if (name) {
            const lineCount = Math.ceil(name.length / 20);
            return 110 + (lineCount - 1) * 25;
          }
        };
        
        const tooltipHeight = getTooltipHeight(charity.name);
        
        const tooltipContent = `
          <div style="width: 250px; height: ${tooltipHeight}px; padding: 10px;">
            <p style="margin: 0; font-weight: bold; font-size: 20px;">${formatName(charity.name)}</p>
            <div style="display: flex; align-items: center; gap: 12px; margin: 5px 0;">
              <p style="margin: 2px 0; font-size: 16px;">⭐ 0 / 5<p>
            </div>
            <p style="margin: 5px 0; font-size: 14px;">
              This charity has not been rated yet
            </p>
          </div>
        `;

        marker.bindTooltip(tooltipContent, {
          permanent: false, 
          direction: "right",
          opacity: 0.9,
          offset: [10, -25],
        });

        marker.on("click", () => {
          setSelectedCharity(charity);
        });
      });
    }
  }, [charitiesData]);

  return (
    <div id="map" className="relative w-full bg-background">
      <div ref={mapRef} className="h-full w-full bg-muted z-0" />

      <AddCharityDialog />

      <Drawer open={!!selectedCharity} onOpenChange={() => setSelectedCharity(null)}>
        <DrawerContent className="p-5 md:p-10 max-h-[90vh] flex flex-col">
          <div className="max-w-7xl w-full mx-auto h-[calc(90vh-100px)] overflow-y-auto p-2 md:p-6">

            {/* CHARITY INFORMATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
              <div>
                <img className="mb-6 h-[200px] w-full max-w-full rounded-lg object-cover" src="/placeholder.png"/>
                <h2 className="mb-2 text-2xl font-bold">{selectedCharity?.name}</h2>
                <div className="mb-2 flex items-center space-x-1">
                  {[...Array(5)].map((_, index) => {
                    const isFilled = index < Math.floor(selectedCharity?.rating ?? 0);
                    const isHalf = index === Math.floor(selectedCharity?.rating ?? 0) && ((selectedCharity?.rating ?? 0) % 1 !== 0);

                    return isHalf ? (
                      <StarHalf key={index} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <Star key={index} className={`w-6 h-6 ${isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}/>
                    );
                  })}
                  <p className="text-gray-400">({selectedCharity?.rating.toFixed(1) ?? "N/A"}/5)</p>
                  <p className="text-gray-400">Total Ratings: {selectedCharity?.total_rating}</p>
                </div>
                <p className="mb-6 text-muted-foreground">
                  {selectedCharity?.description || <span className="italic">No description given yet</span>}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-1 h-4 w-4 shrink-0" />
                  <p>{selectedCharity?.address || <span className="text-muted-foreground italic">No address given</span>}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="mt-1 h-4 w-4 shrink-0" />
                  <p>{selectedCharity?.phone_number || <span className="text-muted-foreground italic">No phone given</span>}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Globe className="mt-1 h-4 w-4 shrink-0" />
                  {selectedCharity?.website_link ? (
                    <a href={selectedCharity.website_link} target="_blank" className="text-blue-500 hover:underline">
                      {selectedCharity.website_link.slice(0, 35)}...
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">No website link given</span>
                  )}
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-1 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Opening Hours</p>
                    <div className="grid grid-cols-2">
                      {selectedCharity?.opening_hours ? (
                        Object.entries(selectedCharity.opening_hours).map(([day, { isOpen, start, end }]) => (
                          <div key={day}><p key={day} className="">{day}:</p>
                          <p>{isOpen ? `${start} - ${end}` : "Closed"}</p></div>
                        ))
                      ) : (
                        <p className="text-muted-foreground italic">No opening hours available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COMMENTS */}
            <hr className="border-gray-300 my-5" />
            <div>
              <div className="flex justify-between">
                <h2 className="mb-2 text-2xl font-bold">Comments</h2>
                {selectedCharity && <div className="flex justify-end"><AddCharityReviewDialog selectedCharityId={selectedCharity.id} /></div>}
              </div>
              
              {commentsData.filter((comment) => comment.charity_id === selectedCharity?.id).length > 0 ? (
                commentsData
                .filter((comment) => comment.charity_id === selectedCharity?.id)
                .map((singleCommentData, index) => (
                  <Card key={index} className="w-full mb-4">
                    <CardHeader className="pb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-5 h-5 ${i < singleCommentData.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                          />
                        ))}
                        <p className="text-sm text-gray-600 pl-3">{format(singleCommentData.created_at, "dd/MM/yyyy")}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="flex">
                      <p className="text-sm">{singleCommentData.comment}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground italic">No comments added yet...</p>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      <Toaster richColors expand={true} />
    </div>
  )
}
