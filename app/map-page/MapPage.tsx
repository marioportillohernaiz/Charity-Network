'use client'

import { useEffect, useRef, useState } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Clock, Globe, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import { Toaster } from "sonner";
import L from "leaflet";


export default function Map({ charitiesData, currentCharity }: { charitiesData: CharityData[]; currentCharity: CharityData; })  {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedCharity, setSelectedCharity] = useState<CharityData | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current).setView([52.7721, -1.2062], 13);
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

      <Drawer open={!!selectedCharity} onOpenChange={() => setSelectedCharity(null)}>
        <DrawerContent className="p-5 md:p-10 max-h-[90vh] flex flex-col">
          <div className="h-[calc(90vh-100px)] overflow-y-auto md:p-6">

            {/* CHARITY INFORMATION */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
              <div>
                <img className="mb-6 h-[200px] w-full max-w-full rounded-lg object-cover" src="/placeholder.png"/>
                <h2 className="mb-2 text-2xl font-bold">{selectedCharity?.name}</h2>
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
                          <><p key={day} className="">{day}:</p>
                          <p>{isOpen ? `${start} - ${end}` : "Closed"}</p></>
                        ))
                      ) : (
                        <p className="text-muted-foreground italic">No opening hours available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      <Toaster richColors expand={true} />
    </div>
  )
}
