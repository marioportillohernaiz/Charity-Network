// RESOURCE TABLE COMPONENT
// This component displays a table of resources with search, filter, and sort functionalities.

"use client"

import { Input } from "../ui/input";
import { ArrowUpDown, Package, Search, Maximize2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationEllipsis, PaginationLink, PaginationNext } from "../ui/pagination";
import { AddResources } from "./add-resources-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { RESOURCE_CATEGORIES } from "@/types/Categories";

export function AllResourcesTable({resourceData} : {resourceData: ResourcesData[];}) {

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ResourcesData; direction: 'asc' | 'desc' }>({ 
    key: 'updated_at', 
    direction: 'desc' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  const filteredResources = resourceData.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) || resource.category?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const requestSort = (key: keyof ResourcesData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getExpiryWarning = (expiry: string | null) => {
    if (!expiry) return null;
    
    const expiryDate = new Date(expiry);
    const today = new Date();
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Expires: {format(expiryDate, 'dd/MM/yyyy')}</Badge>;
    }
  };

  const getPercentage = (resource: ResourcesData, unit: number) => {
    if (resource.quantity === 0) return 0;
    const availablePercent = (unit / resource.quantity) * 100;
    return Math.round(availablePercent);
  };

  const toggleExpandedView = () => {
    setIsExpanded(!isExpanded);
  };

  // Table function to avoid duplication
  const renderTable = () => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
          <th 
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => requestSort('name')}
          >
            <div className="flex items-center">
              Name
              <ArrowUpDown className="h-4 w-4 ml-1" />
            </div>
          </th>
          <th 
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => requestSort('category')}
          >
            <div className="flex items-center">
              Category
              <ArrowUpDown className="h-4 w-4 ml-1" />
            </div>
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Stock
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Charity Stock
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Shareable Quantity
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Reserved Quantity
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Location
          </th>
          <th 
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
            onClick={() => requestSort('updated_at')}
          >
            <div className="flex items-center">
              Last Updated
              <ArrowUpDown className="h-4 w-4 ml-1" />
            </div>
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {paginatedResources.map(resource => (
          <tr key={resource.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex items-center justify-end space-x-2">
                <AddResources resource={resource} action={"editrow"} />
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="ml-2">
                  <div className="text-lg font-medium text-gray-900">{resource.name}</div>
                  <div className="text-xs text-gray-500">{resource.description}</div>
                  {resource.expiry_date && getExpiryWarning(resource.expiry_date.toString())}
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge className="text-sm">{resource.category}</Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <p className="font-semibold">{resource.quantity} {resource.unit}</p>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <p className="font-semibold">{resource.quantity - resource.quantity_reserved - resource.shareable_quantity} {resource.unit}</p>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 flex-shrink-0">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">{getPercentage(resource, resource.shareable_quantity)}%</span>
                  </div>
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200" strokeWidth="3" />
                    {getPercentage(resource, resource.shareable_quantity) > 0 && (
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-blue-600"
                        strokeWidth="3"
                        strokeDasharray={`${getPercentage(resource, resource.shareable_quantity)} 100`}
                      />
                    )}
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{resource.shareable_quantity} {resource.unit}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 flex-shrink-0">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm">{getPercentage(resource, resource.quantity_reserved)}%</span>
                  </div>
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200" strokeWidth="3" />
                    {getPercentage(resource, resource.quantity_reserved) > 0 && (
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-amber-500"
                        strokeWidth="3"
                        strokeDasharray={`${getPercentage(resource, resource.quantity_reserved)} 100`}
                      />
                    )}
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800">{resource.quantity_reserved} {resource.unit}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{resource.location}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{format(new Date(resource.updated_at), 'dd/MM/yyyy HH:mm')}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <Card className="bg-secondary">
      <CardHeader className="pb-3">
        <CardTitle hidden></CardTitle>
      </CardHeader>
      <CardContent>
        {resourceData.length > 0 ? (
        <><div className="mb-4 flex flex-wrap gap-2 sm:flex-nowrap">
          <div className="relative w-full sm:w-96">
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
          <div className="flex gap-2 w-full sm:w-auto">
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
            <Button 
              onClick={toggleExpandedView} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 bg-white"
              title="View full table without horizontal scrolling"
            >
              <Maximize2 className="h-4 w-4" />
              Expand
            </Button>
          </div>
        </div>

        {/* Regular table with horizontal scroll */}
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            {renderTable()}
          </div>
        </div>

        {/* Expanded view modal/overlay */}
        {isExpanded && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start overflow-y-auto p-4" onClick={() => setIsExpanded(false)}>
            <div 
              className="bg-white rounded-lg shadow-xl max-w-[95vw] w-fit my-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-lg">
                <h2 className="text-lg font-semibold">Resource Details</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsExpanded(false)}
                  className="rounded-full h-8 w-8 p-0 flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="overflow-x-auto">
                {renderTable()}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-4">
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p>No available resources</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}