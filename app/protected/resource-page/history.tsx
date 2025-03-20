"use client"

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns-tz';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransitStatus } from '@/types/TransitStatus';

const HistoryTab = ({charity,charityData,resourceData,transitData}:{charity: CharityData;charityData: CharityData[];resourceData: ResourcesData[]; transitData:TransitData[];}) => {
  const sentTransitData = transitData.filter(item => item.charity_from === charity.id && (item.status === TransitStatus.RECEIVED || item.status === TransitStatus.REJECTED));
  const receivedTransitData = transitData.filter(item => item.charity_to === charity.id && (item.status === TransitStatus.RECEIVED || item.status === TransitStatus.REJECTED));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sharing History</h1>
      </div>

      <TransitHistoryTable
        title="Resources Sent To Charities"
        description="History of resources you shared with other charities"
        charityData={charityData}
        resourceData={resourceData}
        transitData={sentTransitData}
      />

      <TransitHistoryTable
        title="Resources Received From Charities"
        description="History of resources shared to your charity"
        charityData={charityData}
        resourceData={resourceData}
        transitData={receivedTransitData}
      />
    </div>
  );
};

const TransitHistoryTable = ({ title, description, charityData, resourceData, transitData} : 
  {title: string; description: string; charityData: CharityData[]; resourceData: ResourcesData[]; transitData: TransitData[];}
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState('all');
  const [selectedCharity, setSelectedCharity] = useState('all');
  
  const uniqueResourceIds = transitData
    .map(item => item.resource_id)
    .filter((value, index, self) => self.indexOf(value) === index);
  const relevantResources = resourceData.filter(resource => uniqueResourceIds.includes(resource.id));

  const charityIdField = title.includes("Sent To") ? 'charity_to' : 'charity_from';
  const uniqueCharityIds = transitData
    .map(item => item[charityIdField])
    .filter((value, index, self) => self.indexOf(value) === index);
  const relevantCharities = charityData.filter(charity => uniqueCharityIds.includes(charity.id));
  
  const filteredTransitData = transitData.filter(item => {
    const charityId = title.includes("Sent To") ? item.charity_to : item.charity_from;
    const charity = charityData.find(c => c.id === charityId) || { name: "Unknown" };
    
    const resource = resourceData.find(r => r.id === item.resource_id) || { name: "Unknown" };
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      resource.name.toLowerCase().includes(searchLower) || 
      charity.name.toLowerCase().includes(searchLower) || 
      item.quantity.toString().includes(searchLower);
    
    const matchesResource = selectedResource === 'all' || item.resource_id === selectedResource;
    const matchesCharity = selectedCharity === 'all' || charityId === selectedCharity;
    
    return matchesSearch && matchesResource && matchesCharity;
  });
  
  const totalPages = Math.ceil(filteredTransitData.length / ITEMS_PER_PAGE);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredTransitData, totalPages, currentPage]);
  
  const currentItems = filteredTransitData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const handlePageChange = (pageNumber : number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  const generatePaginationItems = () => {
    const pages = [];
    pages.push(1);
    
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    
    return pages.sort((a, b) => a - b);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="search" 
              placeholder="Search sharing history..." 
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedResource} onValueChange={setSelectedResource}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Resources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              {relevantResources.map(resource => (
                <SelectItem key={resource.id} value={resource.id}>{resource.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedCharity} onValueChange={setSelectedCharity}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Charities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Charities</SelectItem>
              {relevantCharities.map(charity => (
                <SelectItem key={charity.id} value={charity.id}>{charity.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {currentItems.map(history => {
            const charityDetails = charityData.find(charity => 
              charity.id === (title.includes("Sent To") ? history.charity_to : history.charity_from));
            
            const resourceDetails = resourceData.find(resource => 
              resource.id === history.resource_id
            );
            console.log("============");
            console.log(history.resource_id);
            console.log("============");
            console.log(resourceData);

            return (
              <Card key={history.id} className="p-4 grid grid-cols-6 gap-4">
                <div className="my-auto">
                  <p className="font-medium text-xl">{resourceDetails?.name}</p>
                  <p className="text-gray-500">{history.quantity} {resourceDetails?.unit}</p>
                </div>

                <div className="my-auto col-span-2">
                  <p className="font-medium">{charityDetails?.name}</p>
                  <p className="text-sm text-gray-500">
                    {charityDetails?.address || "No address provided"}
                  </p>
                </div>

                <div className="my-auto">
                  <p className="text-sm text-gray-500">Time Sent</p>
                  <p>{history.time_sent ? (format(history.time_sent, "dd/MM/yyyy hh:mm")) : ("n/a")}</p>
                </div>

                <div className="my-auto">
                  <p className="text-sm text-gray-500">Time Recieved</p>
                  <p>{history.time_received ? (format(history.time_received, "dd/MM/yyyy hh:mm")) : ("n/a")}</p>
                </div>
                
                <div className="my-auto">
                  {history.status === "Received" ? (
                    <Badge className="bg-green-200 text-green-800 hover:bg-green-200">Received</Badge>
                  ) : (
                    <Badge className="bg-red-200 text-red-800 hover:bg-red-200">Rejected</Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end mt-4">
          <div className="text-sm text-gray-500 mr-6">
            Showing {transitData.length > 0 ? Math.min(transitData.length, (currentPage - 1) * ITEMS_PER_PAGE + 1) : 0}-
            {Math.min(currentPage * ITEMS_PER_PAGE, transitData.length)} of {transitData.length} sharing records
          </div>
          
          {totalPages > 1 && (
            <Pagination className="flex justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" aria-disabled={currentPage === 1} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
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
                          <PaginationLink href="#" isActive={page === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    );
                  }
                  
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink href="#" isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext href="#" aria-disabled={currentPage === totalPages} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryTab;