"use client"

import { useEffect, useRef, useState } from "react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Clock, ExternalLink, Facebook, Globe, Instagram, LayersIcon, MapPin, MessageSquareOff, Package, PackageOpen, Phone, Search, Star, StarHalf, Twitter, X } from "lucide-react";
import { format } from "date-fns";
import { Toaster } from "sonner";
let L: typeof import('leaflet');
if (typeof window !== 'undefined') {
  L = require('leaflet');
}
import AddCharityReviewDialog from "@/components/component/add-review-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TransitStatus } from "@/types/TransitStatus";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRIMARY_CATEGORIES } from "@/types/Categories";
import RequestResource from "@/components/component/request-resource";
import { CharityTooltip, TruckIconHtml, TruckTooltipHtml } from "@/components/component/map-tooltips";

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
      const map = L.map(mapRef.current).setView([currentCharity.latitude, currentCharity.longitude], 15);
      mapInstanceRef.current = map;
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      
      if (currentCharity) {
        map.setView([currentCharity.latitude, currentCharity.longitude], 15);
      }
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
        
        const tooltipContent = CharityTooltip(charity);
  
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
      
      drawTransitLines(mapInstanceRef.current, transitData, charityLocations);
      
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
      const charityFrom = charitiesData.find(charity => charity.id === transit.charity_from);
      
      if (fromLocation && toLocation) {
        const lineColor = transit.charity_to === currentCharity?.id ? '#E53935' : '#1E88E5';
        
        const transitLine = L.polyline([fromLocation, toLocation], {
          color: lineColor,
          weight: 3,
          dashArray: '10, 10',
        }).addTo(map);
        
        transitLinesRef.current.push(transitLine);
        const midLat = (fromLocation[0] + toLocation[0]) / 2;
        const midLng = (fromLocation[1] + toLocation[1]) / 2;
        
        const truckIconHtml = TruckIconHtml(lineColor, transit, currentCharity);
        
        const truckIcon = L.divIcon({
          html: truckIconHtml,
          className: 'truck-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        
        const truckMarker = L.marker([midLat, midLng], {
          icon: truckIcon
        }).addTo(map);
        
        truckMarker.bindTooltip(TruckTooltipHtml(transit, charityTo, charityFrom), {
          direction: 'right',
          offset: L.point(15, 0)
        });
        
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

  const sortedResources = [...resources].sort((a, b) => {
    if (a.is_scarce && !b.is_scarce) return -1
    if (!a.is_scarce && b.is_scarce) return 1
    return 0
  })

  return (
    <div id="map" className="relative w-full bg-background">
      <div ref={mapRef} className="h-full w-full bg-muted z-0" />
      
      <div className="flex gap-2 absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md px-4 search-container">
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

      {/* Charity Selected Drawer */}
      <Drawer open={!!selectedCharity} onOpenChange={() => setSelectedCharity(null)}>
        <DrawerContent className="p-5 md:p-10 max-h-[90vh] flex flex-col bg-muted">
          <div className="max-w-7xl w-full mx-auto h-[calc(90vh-100px)] overflow-y-auto p-2 md:p-6 space-y-4">
            <Card>
              <div className="p-6 flex flex-col md:grid md:grid-cols-2 gap-6">
                <div>
                  {selectedCharity?.src_charity_img ? (
                    <img className="aspect-[4/3] w-full rounded-lg object-cover" src={selectedCharity?.src_charity_img || "/placeholder.svg"} alt={selectedCharity?.name || "Charity"} />
                  ) : (
                    <img className="aspect-[4/3] w-full rounded-lg object-cover" src="/placeholder.png" alt="Placeholder"/>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2">Contact Details</h3>

                      <div className="flex items-start gap-3">
                        <div className="bg-gray-100 p-2 rounded-md">
                          <MapPin className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Address</p>
                          <p className="text-sm text-gray-600">
                            {selectedCharity?.address || <span className="text-muted-foreground italic">No address available</span>}
                          </p>
                        </div>
                      </div>

                      {selectedCharity?.settings?.show_phone && (
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-100 p-2 rounded-md">
                            <Phone className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Phone</p>
                            <p className="text-sm text-gray-600">
                              {selectedCharity?.phone_number || (
                                <span className="text-muted-foreground italic">No phone available</span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedCharity?.settings?.show_website && selectedCharity?.website_link && (
                        <div className="flex items-start gap-3">
                          <div className="bg-gray-100 p-2 rounded-md">
                            <Globe className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Website</p>
                            <a
                              href={selectedCharity.website_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {selectedCharity.website_link.length > 25
                                ? `${selectedCharity.website_link.slice(0, 25)}...`
                                : selectedCharity.website_link}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {selectedCharity?.settings?.show_website && (
                        <>
                        <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2">Social Links</h3>
                        {selectedCharity?.facebook_link && (
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-100 p-2 rounded-md">
                              <Facebook className="h-4 w-4 text-gray-600" />
                            </div>
                            <a
                              href={selectedCharity.facebook_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center my-auto "
                            >
                              {selectedCharity?.facebook_link.length > 25 ? `${selectedCharity.facebook_link.slice(0, 25)}...` : selectedCharity.facebook_link}
                            </a>
                          </div>
                        )}
                        {selectedCharity?.instagram_link && (
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-100 p-2 rounded-md">
                              <Instagram className="h-4 w-4 text-gray-600" />
                            </div>
                            <a
                              href={selectedCharity.instagram_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center my-auto "
                            >
                              {selectedCharity?.instagram_link.length > 25 ? `${selectedCharity.instagram_link.slice(0, 25)}...` : selectedCharity.instagram_link}
                            </a>
                          </div>
                        )}
                        {selectedCharity?.twitter_link && (
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-100 p-2 rounded-md">
                              <Twitter className="h-4 w-4 text-gray-600" />
                            </div>
                            <a
                              href={selectedCharity.twitter_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center my-auto "
                            >
                              {selectedCharity?.twitter_link.length > 25 ? `${selectedCharity.twitter_link.slice(0, 25)}...` : selectedCharity.twitter_link}
                            </a>
                          </div>
                        )}
                      </>)}
                    </div>
                  </div>

                  <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider mb-2">Opening Hours</h3>
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-md">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="w-full">
                      <p className="font-semibold text-sm sm:text-base">Opening Hours</p>
                      <div className="grid text-sm sm:text-base">
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
              
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedCharity?.name}</h1>
                    <div className="mb-2 flex flex-wrap items-center space-x-1">
                      {[...Array(5)].map((_, index) => {
                        const isFilled = index < Math.floor(selectedCharity?.rating ?? 0)
                        const isHalf =
                          index === Math.floor(selectedCharity?.rating ?? 0) && (selectedCharity?.rating ?? 0) % 1 !== 0

                        return isHalf ? (
                          <StarHalf key={index} className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 fill-yellow-400" />
                        ) : (
                          <Star
                            key={index}
                            className={`w-5 h-5 sm:w-6 sm:h-6 ${isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        )
                      })}
                      <p className="text-sm sm:text-base text-gray-400">({selectedCharity?.rating?.toFixed(1) ?? "N/A"}/5)</p>
                      <p className="text-sm sm:text-base text-gray-400">Total Ratings: {selectedCharity?.total_rating}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-gray-600 mb-4">{selectedCharity?.description}</p>

                <Badge className="bg-blue-100 text-blue-800 mb-2">
                  {PRIMARY_CATEGORIES.find((cat) => cat.value === selectedCharity?.category_and_tags?.primary)?.label}
                </Badge>

                <div className="mb-4 flex flex-wrap gap-1">
                  {selectedCharity?.category_and_tags?.secondary?.map((tag, i) => (
                    <Badge key={i} variant="outline" className="bg-gray-100 text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center mb-3">
                  <LayersIcon className="h-5 w-5 mr-2 text-blue-500" />
                  <h2 className="text-xl font-semibold">All Available Resources</h2>
                </div>
                {resources.length > 0 && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {resources.length} {resources.length === 1 ? "Resource" : "Resources"}
                  </Badge>
                )}
              </div>

              {resources.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No resources available from this charity</p>
                </div>
              ) : (
                <>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <p>These resources are scarce.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                  {sortedResources.map((resource, index) => (
                    resource.is_scarce && (
                    <div
                      key={index}
                      className={"rounded-md p-3 flex items-center bg-red-50"}
                    >
                      <div className={"w-2 h-2 rounded-full mr-2 bg-red-500"}></div>
                      <span className="text-red-800">
                        {resource.name}
                      </span>
                    </div>
                  )))}
                </div>

                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <p>These resources are available in the charity's stock.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sortedResources.map((resource, index) => (
                    resource.is_scarce ? false : (
                      <div
                        key={index}
                        className={"rounded-md p-3 flex items-center bg-blue-50"}
                      >
                        <div className={"w-2 h-2 rounded-full mr-2 bg-blue-500"}></div>
                        <span className="text-blue-800">
                          {resource.name}
                        </span>
                      </div>
                  )))}
                </div></>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-3">
                <PackageOpen className="h-5 w-5 mr-2 text-blue-500" />
                <h2 className="text-xl font-semibold">Shareable Resources</h2>
              </div>

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
                                        <Calendar size={12} className="mr-1" /> Expires: {format(resource.expiry_date, "dd/MM/yyyy")}
                                      </Badge>
                                    </div>
                                  )}
                                  {currentCharity?.id !== resource.charity_id && (
                                    <RequestResource selectedResource={resource} className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-blue-200 w-full" />
                                  )}
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
                <h2 className="mb-4 text-2xl font-bold">Reviews</h2>
                {selectedCharity && selectedCharity.id !== currentCharity.id && <div className="flex justify-end"><AddCharityReviewDialog selectedCharityId={selectedCharity.id} /></div>}
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
          <Toaster richColors expand={true} />
        </DrawerContent>
      </Drawer>
      <Toaster richColors expand={true} />
    </div>
  )
}