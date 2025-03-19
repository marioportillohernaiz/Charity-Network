
"use client"

import { Input } from "../ui/input";
import { Calendar, CheckSquare, Clock, Search, Truck, XCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationEllipsis, PaginationLink, PaginationNext } from "../ui/pagination";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { TransitStatus } from "@/types/TransitStatus";
import RejectRequest from "./reject-request";
import HandleDispatch from "./handle-dispatch";

export function ResourcesRequestedTable({resourceData, transitData, charityData} : {resourceData: ResourcesData[]; transitData: TransitData[]; charityData: CharityData[]}) {
  const requestedResources = transitData.filter(item => item.status == TransitStatus.REQUESTED || item.status == TransitStatus.IN_TRANSIT);

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof TransitData; direction: 'asc' | 'desc' }>({ 
    key: 'updated_at', 
    direction: 'desc' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showTransitInfo, setShowTransitInfo] = useState("");
  const ITEMS_PER_PAGE = 10;

  const getEstimatedDelivery = (transit: TransitData): Date => {
    if (transit.time_sent) {
      const timeSent = new Date(transit.time_sent);
      const deadline = new Date(timeSent);
      deadline.setDate(deadline.getDate() + 7);
      return deadline;
    }
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    return deadline;
  }

  const getExpirationBadge = (expiration: boolean) => {
    if (expiration) {
      return <Badge className="bg-red-200 text-red-800">Expires</Badge>;
    } else {
      return <Badge className="bg-gray-200 text-gray-800">No Expiration</Badge>;;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Requested':
        return (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-500 mr-1" />
            <Badge className="bg-gray-200 text-gray-800">Requested</Badge>
          </div>
        );
      case 'In transit':
        return (
          <div className="flex items-center">
            <Truck className="h-4 w-4 text-blue-500 mr-1" />
            <Badge className="bg-blue-200 text-blue-800">In transit</Badge>
          </div>
        );
      case 'Received':
        return (
          <div className="flex items-center">
            <CheckSquare className="h-4 w-4 text-green-500 mr-1" />
            <Badge className="bg-green-200 text-green-800">Received</Badge>
          </div>
        );
      case 'Rejected':
        return (
          <div className="flex items-center">
            <XCircle className="h-4 w-4 text-red-500 mr-1" />
            <Badge className="bg-red-200 text-red-800">Rejected</Badge>
          </div>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getActionButton = (request: TransitData) => {
    switch(request.status) {
      case 'Requested':
        return (
          <div>
            <RejectRequest request={request} resourceData={resourceData} />
            <HandleDispatch request={request} resourceData={resourceData} />
          </div>
        );
      case 'In transit':
        return (
          <Button 
            variant="outline" 
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 w-full"
            onClick={() => setShowTransitInfo(showTransitInfo === request.id ? "" : request.id)}
          >
            {showTransitInfo === request.id ? "Hide Tracking" : "Track Shipment"}
          </Button>
        );
      default:
        return (<></>);
    }
  };

  const filteredResources = requestedResources.filter(transit => {
    const resourceDetails = resourceData.find(resource => 
      resource.id === transit.resource_id
    );

    const matchesSearch = resourceDetails?.name.toLowerCase().includes(searchTerm.toLowerCase()) || resourceDetails?.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedStatus === 'All' || transit.status === selectedStatus;
    
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
        <CardTitle hidden></CardTitle>
      </CardHeader>
      <CardContent>
        {resourceData.length > 0 ? (
        <><div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex flex-grow flex-wrap gap-2">
            <div className="relative flex-grow max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                type="search" 
                placeholder="Search requests..." 
                className="pl-8 w-full" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="bg-white border rounded-md px-3 py-1 text-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Requested">Requested</option>
              <option value="In transit">In transit</option>
              <option value="Received">Received</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Charity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResources.map(request => {

                  const charityDetails = charityData.find(charitySingle => 
                    charitySingle.id === request.charity_to
                  );

                  const resourceDetails = resourceData.find(resource => 
                    resource.id === request.resource_id
                  );

                  return (
                  <React.Fragment key={request.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          {getActionButton(request)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-2">
                            <p className="text-sm font-medium text-gray-900">{charityDetails?.name}</p>
                            <p className="text-xs text-gray-500">{charityDetails?.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{resourceDetails?.name}</p>
                        <p className="text-xs text-gray-500 max-w-xs truncate">{request.description}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">{request.quantity.toLocaleString()}</p>
                        <div className="text-xs text-green-600">
                          {resourceDetails?.shareable_quantity} available to match
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getExpirationBadge(request.can_expire)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                        {getEstimatedDelivery(request) && (
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            Est. delivery: {format(getEstimatedDelivery(request), "dd/MM/yyyy  hh:mm")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{format(request.updated_at, "dd/mm/yyyy hh:mm")}</div>
                      </td>
                    </tr>

                    {showTransitInfo === request.id && request.status == TransitStatus.IN_TRANSIT && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="border border-blue-200 rounded-md bg-blue-50 p-4">
                            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                              <Truck className="h-4 w-4 mr-2" />
                              Shipment Details
                            </h4>
                            <Separator className="my-3"/>
                            <div key={request.id} className="mb-4 last:mb-0">
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <div className="text-sm pb-2">
                                    <span className="text-gray-500 block text-xs">Requested Units:</span>
                                    {request.quantity} {resourceDetails?.unit}
                                  </div>

                                  {request.time_sent && (
                                    <div className="text-sm pb-2">
                                      <span className="text-gray-500 block text-xs">Time Sent:</span>
                                      {format(request.time_sent, "dd/MM/yyyy hh:mm")}
                                    </div>
                                  )}
                                  
                                  {getEstimatedDelivery(request) && !request.time_received && (
                                    <div className="text-sm">
                                      <span className="text-gray-500 block text-xs">Estimated Delivery:</span>
                                      {format(getEstimatedDelivery(request), "dd/mm/yyyy hh:mm")}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="col-span-2">
                                  {request.id && (
                                    <div className="text-sm">
                                      <span className="text-gray-500 block text-xs">Tracking Number:</span>
                                      <span className="font-mono">{request.id}</span>
                                    </div>
                                  )}
                                  <div className="mt-3 relative">
                                    <div className="flex items-center space-x-2">
                                      <div className={`h-2 w-2 rounded-full bg-green-500`}></div>
                                      <div className="text-xs">Preparing</div>
                                      <div className={`h-0.5 w-12 bg-green-500`}></div>
                                      <div className={`h-2 w-2 rounded-full bg-green-500`}></div>
                                      <div className="text-xs">In Transit</div>
                                      <div className={`h-0.5 w-6 bg-green-500`}></div>
                                      <div className={`h-0.5 w-6 bg-gray-300`}></div>
                                      <div className={`h-2 w-2 rounded-full bg-gray-300`}></div>
                                      <div className="text-xs">Delivered</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )})}
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