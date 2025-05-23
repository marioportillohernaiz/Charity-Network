// REQUEST RESOURCES TABLE
// This component displays a table of resources available from other charities.
// Users can search based on location, filter, and sort the resources based on various criteria.

"use client"

import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { RESOURCE_CATEGORIES } from '@/types/Categories';
import { MatchScore } from './match-score-column';
import RequestResource from './request-resource';

export function SharedResourcesTable({resourceData, charityData, charity, recommendation} : {resourceData: ResourcesData[]; charityData: CharityData[]; charity: CharityData; recommendation: string | null;}) {
  const sharedResources = resourceData.filter(item => item.shareable_quantity > 0);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ResourcesData; direction: 'asc' | 'desc' }>({ 
    key: 'updated_at', 
    direction: 'desc' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Location filtering state
  const [searchRadius, setSearchRadius] = useState<number>(0);
  const [filteredByDistance, setFilteredByDistance] = useState<ResourcesData[]>([]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c;
    return distance;
  };

  const handleRadiusChange = (value: number) => {
    setSearchRadius(value);
    if (value === 0) {
      setFilteredByDistance([]);
    } else {
      const resourcesWithinRadius = sharedResources.filter(resource => {
        const resourceCharity = charityData.find(c => c.id === resource.charity_id);
        if (!resourceCharity) return false;
        
        const distance = calculateDistance(
          charity.latitude, 
          charity.longitude, 
          resourceCharity.latitude, 
          resourceCharity.longitude
        );
        
        return distance <= value;
      });
      
      setFilteredByDistance(resourcesWithinRadius);
    }
    setCurrentPage(1);
  };

  const getExpirationBadge = (expiryDate: Date | undefined) => {
    if (!expiryDate) {
      return <Badge className="bg-gray-200 text-gray-800">No Expiration</Badge>;
    }
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (expiry < today) {
      return <Badge className="bg-red-200 text-red-800">Expired</Badge>;
    } else {
      const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 7) {
        return <Badge className="bg-yellow-200 text-yellow-800 break-words">Expires Soon ({format(expiry, "dd/MM/yyyy")})</Badge>;
      } else {
        return <Badge className="bg-green-200 text-green-800">Expires {format(expiry, "dd/MM/yyyy")}</Badge>;
      }
    }
  };

  const filteredResources = (searchRadius > 0 ? filteredByDistance : sharedResources).filter(resource => {
    const matchesSearch = 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === null && bValue !== null) return 1;
    if (aValue !== null && bValue === null) return -1;
    if (aValue === null && bValue === null) return 0;
    
    if (aValue! < bValue!) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue! > bValue!) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  const totalPages = Math.ceil(sortedResources.length / ITEMS_PER_PAGE);
  const paginatedResources = sortedResources.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const generatePaginationItems = () => {
    const pageNumbers = [];
    pageNumbers.push(1);
    
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (pageNumbers.indexOf(i) === -1) {
        pageNumbers.push(i);
      }
    }
    
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    return pageNumbers.sort((a, b) => a - b);
  };
  
  const handlePageChange = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const getDistanceFromCharity = (resourceCharity: CharityData) => {
    if (!charity || !resourceCharity) return null;
    
    const distance = calculateDistance(
      charity.latitude,
      charity.longitude,
      resourceCharity.latitude,
      resourceCharity.longitude
    );
    
    return distance.toFixed(1);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Resources Available from Other Charities</CardTitle>
      </CardHeader>
      <CardContent>
        {sharedResources.length > 0 ? (
        <><div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex flex-grow flex-wrap gap-2">
            <div className="relative flex-grow max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                type="search" 
                placeholder="Search resources..." 
                className="pl-8 w-full" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <select 
              className="bg-white border rounded-md px-3 py-1 text-sm"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              {RESOURCE_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-100 p-4 my-5 rounded-md w-full sm:w-auto">
          <div className="flex items-center mb-2">
            <MapPin className="mr-2 h-4 w-4 text-blue-500" />
            <Label htmlFor="radius-slider" className="font-medium">
              Distance: {searchRadius === 0 ? "All locations" : `${searchRadius} km radius`}
            </Label>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">Off</span>
            <Slider
              id="radius-slider"
              min={0}
              max={50}
              step={1}
              value={[searchRadius]}
              onValueChange={(values) => handleRadiusChange(values[0])}
              className="flex-1"
            />
            <span className="text-xs text-gray-500">50km</span>
          </div>

          {searchRadius > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              <div>
                Showing resources within {searchRadius} km of your charity
                {filteredByDistance.length === 0 && (
                  <div className="mt-1 text-amber-600">No resources found within this radius</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Request Resources Table */}
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Charity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedResources.length > 0 ? paginatedResources.map(resource => {
                  const charityDetails = charityData.find(charitySingle => 
                    charitySingle.id === resource.charity_id
                  );

                  const distance = charityDetails ? getDistanceFromCharity(charityDetails) : null;

                  return (
                  <React.Fragment key={resource.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <RequestResource selectedResource={resource} className="bg-green-100 text-green-800 hover:bg-green-100 border-green-400 w-full" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <h3 className="text-base font-bold text-gray-900">{resource.name}</h3>
                          <p className="text-sm font-medium text-gray-600 mt-1">
                            {resource.shareable_quantity} {resource.unit} available
                          </p>
                          {resource.description && (
                            <p className="text-xs text-gray-500 max-w-xs mt-1 truncate">{resource.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <MatchScore 
                          resource={resource} 
                          charity={charity}
                          recommendation={recommendation}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{charityDetails?.name}</p>
                        <p className="text-xs text-gray-500 max-w-xs break-words">{charityDetails?.address}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {distance ? (
                          <Badge className="bg-blue-100 text-blue-800">
                            {distance} km
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getExpirationBadge(resource?.expiry_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{format(resource.updated_at, "dd/MM/yyyy HH:mm")}</div>
                      </td>
                    </tr>
                  </React.Fragment>
                )}) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No resources found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between mt-4 gap-2">
          <div className="text-sm text-gray-500">
            Showing {filteredResources.length > 0 ? Math.min(filteredResources.length, (currentPage - 1) * ITEMS_PER_PAGE + 1) : 0}-
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredResources.length)} of {filteredResources.length} resources
          </div>
          
          {totalPages > 1 && (
            <Pagination className="flex justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {generatePaginationItems().map((page, index, array) => {
                  if (index > 0 && page > array[index - 1] + 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    );
                  }
                  
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div></>
      ) : (<p className="text-center py-8 text-gray-500">No resources available for sharing from other charities</p>)}
      </CardContent>
    </Card>
  );
}