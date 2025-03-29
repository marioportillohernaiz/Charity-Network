'use client'

import { useEffect, useRef, useState } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Calendar, ChevronLeft, ChevronRight, Clock, ExternalLink, Globe, MapPin, MessageSquareOff, Package, Phone, Search, Star, StarHalf, X } from "lucide-react";
import { format } from "date-fns";
import { Toaster } from "sonner";
import L from "leaflet";
import AddCharityDialog from "@/components/component/add-charity-dialog";
import AddCharityReviewDialog from "@/components/component/add-review-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TransitStatus } from "@/types/TransitStatus";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRIMARY_CATEGORIES } from "@/types/Categories";
import { Progress } from "@/components/ui/progress";
import RequestResource from "@/components/component/request-resource";

export default function Map({ charitiesData, currentCharity, commentsData, transitData, resourcesData }: { charitiesData: CharityData[]; currentCharity: CharityData; commentsData: ReviewComments[]; transitData: TransitData[]; resourcesData: ResourcesData[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedCharity, setSelectedCharity] = useState<CharityData | null>(null);
  const [resources, setResources] = useState<ResourcesData[]>([]);
  const transitLinesRef = useRef<L.Polyline[]>([]);
  const transitIconsRef = useRef<L.Marker[]>([]);
  const markersRef = useRef<L.Marker[]>([]);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CharityData[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 300;
      if (direction === 'left') {
        categoriesScrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        categoriesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

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
        charity.admin_verified &&
        (!selectedCategory || charity.category_and_tags?.primary === selectedCategory)
      )
      .slice(0, 6);

    setSearchResults(filteredCharities);
  }, [searchQuery, charitiesData, selectedCategory]);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const map = L.map(mapRef.current).setView([52.7721, -1.2062], 15);
      mapInstanceRef.current = map;
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }
    
    if (!mapInstanceRef.current) return;
    
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    transitLinesRef.current.forEach(line => line.remove());
    transitLinesRef.current = [];
    transitIconsRef.current.forEach(icon => icon.remove());
    transitIconsRef.current = [];
    
    const filteredCharities = charitiesData.filter(charity => 
      charity.admin_verified && 
      (!selectedCategory || charity.category_and_tags?.primary === selectedCategory)
    );
    
    const charityLocations: Record<string, [number, number]> = {};
    
    if (filteredCharities.length > 0) {
      const customIcon = L.icon({
        iconUrl: "/pin.png",
        iconSize: [25, 35],
        iconAnchor: [16, 40],
      });
      
      const charityIcon = L.icon({
        iconUrl: "/pincharity.png", 
        iconSize: [27, 40],
        iconAnchor: [16, 40],
      });
      
      filteredCharities.forEach((charity) => {
        charityLocations[charity.id] = [charity.latitude, charity.longitude];
        
        const marker = charity.id === currentCharity?.id ? 
          L.marker([charity.latitude, charity.longitude], { icon: charityIcon }).addTo(mapInstanceRef.current!) : 
          L.marker([charity.latitude, charity.longitude], { icon: customIcon }).addTo(mapInstanceRef.current!);
          
        markersRef.current.push(marker);
        
        const tooltipContent = `
          <div style="padding: 1rem; width: 100%;">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">${charity.name}</h3>
            ${charity.description ? `<p style="font-size: 0.875rem; color: #718096; margin-bottom: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${charity.description && charity.description.substring(0, 50) + '...'}</p>` : ''}
            
            <div style="margin-bottom: 0.75rem;">
              <span style="display: inline-block; background-color: #E6F0FD; color: #1E429F; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 9999px; margin-right: 0.25rem;">
                ${PRIMARY_CATEGORIES.find(cat => cat.value === charity.category_and_tags.primary)?.label || charity.category_and_tags.primary}
              </span>
              ${charity.category_and_tags.secondary.slice(0, 2).map(tag => `
                <span style="display: inline-block; background-color: #F1F1F1; color: #4A5568; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 9999px; margin-right: 0.25rem;">
                  ${tag}
                </span>
              `).join('')}
            </div>
  
            ${charity.rating > 0 ? `
              <div style="display: flex; align-items: center; margin-bottom: 0.75rem;">
                <div style="display: flex;">
                  <p style="margin: 2px 0; font-size: 16px;">⭐ ${charity.rating} / 5 (${charity.total_rating} ratings)</p>
                </div>
              </div>
            ` : ''}
  
            <div style="display: flex; align-items: flex-start; margin-bottom: 0.5rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem; margin-top: 0.25rem; flex-shrink: 0; color: #718096;">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span style="font-size: 0.875rem;">${charity.address}</span>
            </div>
  
            ${charity.opening_hours ? `
              <div style="display: flex; align-items: flex-start; margin-bottom: 0.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem; margin-top: 0.25rem; flex-shrink: 0; color: #718096;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <div style="font-size: 0.875rem;">
                  ${(() => {
                    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
                    const hours = charity.opening_hours[today];
                    if (hours?.isOpen) {
                      return `Today: ${hours.start} - ${hours.end}`;
                    }
                    return "Closed today";
                  })()}
                </div>
              </div>
            ` : ''}
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
          setResources(resourcesData.filter(resource => resource.charity_id === charity.id));          
        });
      });
      
      // Draw transit lines
      drawTransitLines(mapInstanceRef.current, transitData, charityLocations);
      
      // Adjust map view to fit all visible charities
      if (filteredCharities.length > 0) {
        const bounds = L.latLngBounds(filteredCharities.map(c => [c.latitude, c.longitude]));
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }
  }, [charitiesData, transitData, selectedCategory]);

  const handleCharitySelect = (charity: CharityData) => {
    setSelectedCharity(charity); 
    setResources(resourcesData.filter(resource => resource.charity_id === charity.id));
    setSearchQuery("");
    setShowResults(false);
  };

  const handleCategorySelect = (categoryValue: string) => {
    if (selectedCategory === categoryValue) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryValue);
    }
  };

  const drawTransitLines = (map: L.Map, transits: TransitData[], charityLocations: Record<string, [number, number]>) => {
    const inTransitResources = transits && transits.filter(transit => 
      transit.status === TransitStatus.IN_TRANSIT && 
      (transit.charity_to === currentCharity?.id || transit.charity_from === currentCharity?.id)
    );
    
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

  const resourcesByCategory = resources?.reduce((acc, resource) => {
    if (resource.shareable_quantity > 0) {
      if (!acc[resource.category]) {
        acc[resource.category] = [];
      }
      acc[resource.category].push(resource);
    }
    return acc;
  }, {} as Record<string, ResourcesData[]>) || {};

  return (
    <div id="map" className="relative w-full bg-background">
      <div ref={mapRef} className="h-full w-full bg-muted z-0" />
      
      <div className="flex gap-2 absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4 search-container">
        <AddCharityDialog />

        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for charities..."
              className="pl-10 pr-10 py-2 w-full border border-input rounded-full shadow-lg"
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
          
          {showResults && searchResults.length > 0 && (
            <div className="absolute w-full mt-12 bg-background border border-input rounded-md shadow-lg z-20 max-h-80 overflow-y-auto">
              {searchResults.map((charity) => (
                <div 
                  key={charity.id}
                  className="p-3 cursor-pointer border-b last:border-b-0"
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

      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-3xl px-4">
        <div className="flex items-center rounded-md mb-2">
          <Button 
            size="icon"
            className="shrink-0 h-7 w-7 rounded-full p-0"
            onClick={() => scrollCategories('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div 
            ref={categoriesScrollRef}
            className="flex items-center space-x-2 py-2 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {PRIMARY_CATEGORIES.map((category) => (
              <Badge 
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "secondary"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleCategorySelect(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
          
          <Button 
            size="icon" 
            className="shrink-0 h-7 w-7 rounded-full p-0"
            onClick={() => scrollCategories('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Drawer open={!!selectedCharity} onOpenChange={() => setSelectedCharity(null)}>
        <DrawerContent className="p-5 md:p-10 max-h-[90vh] flex flex-col bg-muted">
          <div className="max-w-7xl w-full mx-auto h-[calc(90vh-100px)] overflow-y-auto p-2 md:p-6 space-y-4">
            
            <Card>
              <div className="overflow-hidden p-6 grid grid-cols-2">
                {selectedCharity?.src_charity_img ? (
                  <img className="mb-6 h-[300px] w-full max-w-full rounded-lg object-cover" src={selectedCharity?.src_charity_img}/>
                ) : (
                  <img className="mb-6 h-[200px] w-full max-w-full rounded-lg object-cover" src="/placeholder.png"/>
                ) }

                <div className="pl-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-1 h-4 w-4 shrink-0" />
                      <p>{selectedCharity?.address || <span className="text-muted-foreground italic">No address given</span>}</p>
                    </div>
                    {selectedCharity?.settings.show_phone &&
                      <div className="flex items-start gap-2">
                        <Phone className="mt-1 h-4 w-4 shrink-0" />
                        <p>{selectedCharity?.phone_number || <span className="text-muted-foreground italic">No phone given</span>}</p>
                      </div>
                    }
                    {selectedCharity?.settings.show_website &&
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
                    }
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
              </div>
              <div className="px-6 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedCharity?.name}</h1>
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
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{selectedCharity?.description}</p>

                <Badge className="bg-blue-100 text-blue-800 mb-2">
                  {PRIMARY_CATEGORIES.find(cat => cat.value === selectedCharity?.category_and_tags.primary)?.label}
                </Badge>

                <div className="mb-4 flex flex-wrap gap-1">
                  {selectedCharity?.category_and_tags.secondary.map((tag, i) => (
                    <Badge key={i} variant="outline" className="bg-gray-100">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Charity Resources</h2>

              {resources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No resources available at this time</p>
                </div>
              ) : (
                <>
                  {/* Resource Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-green-800 mb-1">Shareable Quantity</h3>
                      <p className="text-2xl font-bold">{resources?.filter(r => r.shareable_quantity > 0).reduce((total, resource) => total + resource.shareable_quantity, 0) || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-purple-800 mb-1">Categories</h3>
                      <p className="text-2xl font-bold">{new Set(resources?.map(resource => resource.category) || []).size}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(resourcesByCategory).map(([category, categoryResources]) => (
                      <div key={category}>
                        <h3 className="text-lg font-medium mb-3 border-b pb-2">{category}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categoryResources.map((resource) => {
                            const availabilityLevel = 
                              resource.shareable_quantity > 10 ? "high" : 
                              resource.shareable_quantity > 5 ? "medium" : "low";
                                
                            return (
                              <div key={resource.id} className="border rounded-lg overflow-hidden transition-shadow hover:shadow-md">
                                <div className={`h-1 w-full ${
                                  availabilityLevel === "high" ? "bg-green-500" : 
                                  availabilityLevel === "medium" ? "bg-amber-500" : "bg-red-500"
                                }`} />
                                
                                <div className="p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-medium">{resource.name}</h4>
                                    <div className="flex items-center">
                                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                        availabilityLevel === "high" ? "bg-green-500" : 
                                        availabilityLevel === "medium" ? "bg-amber-500" : "bg-red-500"
                                      }`}></span>
                                      <Badge
                                        variant="outline"
                                        className={
                                          availabilityLevel === "high" ? "border-green-500 text-green-700" : 
                                          availabilityLevel === "medium" ? "border-amber-500 text-amber-700" : "border-red-500 text-red-700"
                                        }
                                      >
                                        {resource.shareable_quantity} {resource.unit}
                                      </Badge>
                                    </div>
                                  </div>

                                  {resource.description && (
                                    <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                                  )}

                                  {resource.expiry_date && (
                                    <div className="my-3">
                                      <Badge variant="destructive" className="text-xs">
                                        <Calendar size={12} className="mr-1" /> Expires: {new Date(resource.expiry_date).toLocaleDateString()}
                                      </Badge>
                                    </div>
                                  )}
                                  <RequestResource selectedResource={resource} className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-200 w-full" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex justify-between">
                <h2 className="mb-4 text-2xl font-bold">Comments</h2>
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
                <div className="text-center py-8 text-gray-500">
                  <MessageSquareOff size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No comments added yet...</p>
                </div>
              )}
            </Card>
          </div>
        </DrawerContent>
      </Drawer>
      <Toaster richColors expand={true} />
    </div>
  )
}