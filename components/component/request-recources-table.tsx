"use client"

import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationEllipsis, PaginationLink, PaginationNext } from "../ui/pagination";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { requestResource } from "@/app/actions";
import { RESOURCE_CATEGORIES } from "@/types/Categories";

export function SharedResourcesTable({resourceData, charityData} : {resourceData: ResourcesData[]; charityData: CharityData[]}) {
  const sharedResources = resourceData.filter(item => item.shareable_quantity > 0);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ResourcesData; direction: 'asc' | 'desc' }>({ 
    key: 'updated_at', 
    direction: 'desc' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourcesData | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const ITEMS_PER_PAGE = 10;

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

  const handleRequestClick = (resource: ResourcesData) => {
    setSelectedResource(resource);
    setRequestQuantity(1);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const response = await requestResource(selectedResource, requestQuantity, notes);
    if (response.success) {
      toast.success(response.message);
      setIsDialogOpen(false);
    } else {
      toast.error(response.message);
    }
  }

  const filteredResources = sharedResources.filter(resource => {
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

        {/* Resources Table */}
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
                      Charity
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
                  {filteredResources.map(resource => {

                    const charityDetails = charityData.find(charitySingle => 
                      charitySingle.id === resource.charity_id
                    );

                    return (
                    <React.Fragment key={resource.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-center space-x-2">
                            <Button 
                              variant="outline" 
                              className="bg-green-100 text-green-800 hover:bg-green-100 border-green-400 w-full"
                              onClick={() => handleRequestClick(resource)}
                            >
                              Request
                            </Button>
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
                          <p className="text-sm text-gray-900">{charityDetails?.name}</p>
                          <p className="text-xs text-gray-500 max-w-xs break-words">{charityDetails?.address}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getExpirationBadge(resource?.expiry_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{format(resource.updated_at, "dd/mm/yyyy hh:mm")}</div>
                        </td>
                      </tr>
                    </React.Fragment>
                  )})}
                </tbody>
              </table>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between mt-4 gap-2">
          <div className="text-sm text-gray-500">
            Showing {Math.min(filteredResources.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-
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

      {/* Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request: {selectedResource?.name}</DialogTitle>
            <DialogDescription>
              Specify how many units you would like to request.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6">
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="quantity" className="font-medium">
                Quantity
              </Label>
              <div className="w-full">
                <Slider
                  id="quantity"
                  min={1}
                  max={selectedResource?.shareable_quantity || 1}
                  step={1}
                  value={[requestQuantity]}
                  onValueChange={(value) => setRequestQuantity(value[0])}
                  className="my-2"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {requestQuantity} {selectedResource?.unit}
                  </p>
                  <p className="text-xs text-gray-500">
                    Max: {selectedResource?.shareable_quantity} {selectedResource?.unit}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor="note" className="font-medium">
                Notes
              </Label>
              <Textarea
                id="note"
                placeholder="Add a note to the charity (optional)"
                className="w-full border rounded-md p-2"
                rows={3}
                value={[notes]}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="link" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}