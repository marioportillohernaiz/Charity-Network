'use client'

import { useEffect, useRef, useState } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Clock, Globe, MapPin, Phone, Search, Star, StarHalf, X } from "lucide-react";
import { format } from "date-fns";
import { Toaster } from "sonner";
import L from "leaflet";
import AddCharityDialog from "@/components/component/add-charity-dialog";
import AddCharityReviewDialog from "@/components/component/add-review-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TransitStatus } from "@/types/TransitStatus";
import { Input } from "@/components/ui/input";


export default function Map({ charitiesData, currentCharity, commentsData, transitData }: { charitiesData: CharityData[]; currentCharity: CharityData; commentsData: ReviewComments[]; transitData: TransitData[]; }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedCharity, setSelectedCharity] = useState<CharityData | null>(null);
  const transitLinesRef = useRef<L.Polyline[]>([]);
  const transitIconsRef = useRef<L.Marker[]>([]);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CharityData[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Filter charities based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filteredCharities = charitiesData
      .filter(charity => 
        (charity.name?.toLowerCase().includes(query) || 
         charity.address?.toLowerCase().includes(query)) &&
        charity.admin_verified
      )
      .slice(0, 6); // Limit to 6 results

    setSearchResults(filteredCharities);
  }, [searchQuery, charitiesData]);

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
      iconAnchor: [16, 40], //12, 36
    });
    const charityIcon = L.icon({
      iconUrl: "/pincharity.png",
      iconSize: [27, 40],
      iconAnchor: [16, 40],
    });

    const charityLocations: Record<string, [number, number]> = {};
    if (charitiesData) {
      charitiesData
      .filter((charity) => charity.admin_verified)
      .forEach((charity) => {
        charityLocations[charity.id] = [charity.latitude, charity.longitude];
        
        const marker = charity.id == currentCharity.id ? 
          L.marker([charity.latitude, charity.longitude], { icon: charityIcon }).addTo(map) : 
          L.marker([charity.latitude, charity.longitude], { icon: customIcon }).addTo(map);

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
          <div style="width: 250px; height: ${tooltipHeight}px; padding: 10px; border-radius: 30px;">
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

      drawTransitLines(map, transitData, charityLocations);
    }
  }, [charitiesData, transitData]);

  // Handle charity selection from search results
  const handleCharitySelect = (charity: CharityData) => {
    if (mapInstanceRef.current) {
      // Center map on selected charity
      mapInstanceRef.current.setView([charity.latitude, charity.longitude], 16);
      
      // Set selected charity to show drawer
      setSelectedCharity(charity);
      
      // Clear search
      setSearchQuery("");
      setShowResults(false);
    }
  };

  const drawTransitLines = (map: L.Map, transits: TransitData[], charityLocations: Record<string, [number, number]>) => {
    const inTransitResources = transits && transits.filter(transit => transit.status === TransitStatus.IN_TRANSIT);
    
    inTransitResources.forEach(transit => {
      const fromLocation = charityLocations[transit.charity_from];
      const toLocation = charityLocations[transit.charity_to];
      const charityTo = charitiesData.find(charity => charity.id === transit.charity_to);
      
      if (fromLocation && toLocation) {
        const lineColor = transit.charity_to === currentCharity?.id ? '#E53935' : '#1E88E5';
        
        const transitLine = L.polyline([fromLocation, toLocation], {
          color: lineColor,
          weight: 3,
        }).addTo(map);
        
        transitLinesRef.current.push(transitLine);
        const midLat = (fromLocation[0] + toLocation[0]) / 2;
        const midLng = (fromLocation[1] + toLocation[1]) / 2;
        
        const truckIconHtml = `
        <div style="background-color: ${lineColor};border-radius: 50%;width: 30px;height: 30px;display: flex;justify-content: center;align-items: center;
          ${transit.charity_to === currentCharity?.id ? 'transform: scaleX(-1);' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 17h4V5H2v12h3"/>
              <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/>
              <circle cx="7.5" cy="17.5" r="2.5"/>
              <circle cx="17.5" cy="17.5" r="2.5"/>
            </svg>
          </div>
        `;
        
        const truckIcon = L.divIcon({
          html: truckIconHtml,
          className: 'truck-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        
        const truckMarker = L.marker([midLat, midLng], {
          icon: truckIcon
        }).addTo(map);
        
        truckMarker.bindTooltip(`
          <div style="padding: 8px;">
            <p style="margin: 0; font-weight: bold; font-size: 15px;">Resource in Transit</p>
            <p style="margin: 5px 0 0;">Charity to: ${charityTo?.name}</p>
            <p style="margin: 5px 0 0;">Item: ${transit.resource_id}</p>
            <p style="margin: 2px 0 0;">Quantity: ${transit.quantity}</p>
            <p style="margin: 2px 0 0;">${transit.description || 'No description'}</p>
          </div>
        `);
        
        transitIconsRef.current.push(truckMarker);
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showResults && target && !target.closest('.search-container')) {
        setShowResults(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  return (
    <div id="map" className="relative w-full bg-background">
      <div ref={mapRef} className="h-full w-full bg-muted z-0" />
      
      {/* Search bar */}
      <div className="flex gap-2 absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4 search-container">
        <AddCharityDialog />

        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for charities..."
              className="pl-10 pr-10 py-2 w-full border border-input shadow-lg"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          {/* Search results dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute w-full mt-1 bg-background border border-input rounded-md shadow-lg z-20 max-h-80 overflow-y-auto">
              {searchResults.map((charity) => (
                <div 
                  key={charity.id}
                  className="p-3 cursor-pointer hover:bg-accent border-b last:border-b-0"
                  onClick={() => handleCharitySelect(charity)}
                >
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 mt-0.5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">{charity.name}</p>
                      {charity.address && (
                        <p className="text-sm text-muted-foreground truncate">{charity.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
                    <div className="grid grid-rows-7">
                      {selectedCharity?.opening_hours ? (
                        Object.entries(selectedCharity.opening_hours).map(([day, { isOpen, start, end }]) => (
                          <div key={day} className="grid grid-cols-2">
                            <p>{day}:</p>
                            <p>{isOpen ? `${start} - ${end}` : "Closed"}</p>
                          </div>
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