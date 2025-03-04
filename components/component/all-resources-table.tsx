
"use client"

import { Input } from "../ui/input";
import { ArrowUpDown, Search } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationEllipsis, PaginationLink, PaginationNext } from "../ui/pagination";
import { AddResources } from "./add-resources";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

export function AllResourcesTable({resourceData, isShareable} : {resourceData: ResourcesData[]; isShareable: boolean;}) {
  const shareableResources = resourceData.filter(resource => resource.shareable_quantity > 0) || [];
  const resources = isShareable ? shareableResources : resourceData;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ResourcesData; direction: 'asc' | 'desc' }>({ 
    key: 'updated_at', 
    direction: 'desc' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredResources = resources.filter(resource => {
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
      return <Badge className="bg-yellow-100 text-yellow-800">Can Expire</Badge>;
    }
  };

  const getPercentage = (resource: ResourcesData, unit: number) => {
    if (resource.quantity === 0) return 0;
    const availablePercent = (unit / resource.quantity) * 100;
    return Math.round(availablePercent);
  };

  const categories = ["All", "Food","Clothing & Personal Items","Household & Shelter Supplies","Medical & Health Supplies",
    "Technology Equipment","Office Equipment","Educational Materials","Transportation & Mobility",
    "Emergency Aid","Volunteer & Human Resources","Financial & Grant Support","Other"]


  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle hidden></CardTitle>
      </CardHeader>
      <CardContent>
        {resources.length > 0 ? (
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
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Available Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reserved Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shareable Quantity
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedResources.map(resource => (
                <tr key={resource.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                        <div className="text-xs text-gray-500">{resource.description}</div>
                        {resource.expiry_date && getExpiryWarning(resource.expiry_date.toString())}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className="text-sm" variant="outline">{resource.category}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span>{resource.quantity - resource.quantity_reserved - resource.shareable_quantity} {resource.unit}</span>
                      <div className="text-xs text-gray-500">Total Units: {resource.quantity}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-24">
                      <span className="text-sm">{resource.quantity_reserved} {resource.unit}</span>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{getPercentage(resource, resource.quantity_reserved)}%</span>
                        <Progress value={getPercentage(resource, resource.quantity_reserved)} className="h-2 ml-2 mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span>{resource.shareable_quantity} {resource.unit}</span>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{getPercentage(resource, resource.shareable_quantity)}%</span>
                        <Progress value={getPercentage(resource, resource.shareable_quantity)} className="h-2 ml-2 mt-1" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{resource.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{format(new Date(resource.updated_at), 'dd/MM/yyyy HH:mm')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <AddResources resource={resource} action={"editrow"} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
      ) : (<p>No available resources</p>)}
      </CardContent>
    </Card>
  );
}