"use client"

import React, { useEffect, useState } from 'react';
import { Calendar, Download, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns-tz';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransitStatus } from '@/types/TransitStatus';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const HistoryTab = ({charity,charityData,resourceData,transitData,salesData}:{charity: CharityData;charityData: CharityData[];resourceData: ResourcesData[]; transitData:TransitData[];salesData: Sales[];}) => {
  const sentTransitData = transitData.filter(item => item.charity_from === charity.id && (item.status === TransitStatus.RECEIVED || item.status === TransitStatus.REJECTED));
  const receivedTransitData = transitData.filter(item => item.charity_to === charity.id && (item.status === TransitStatus.RECEIVED || item.status === TransitStatus.REJECTED));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sharing History</h1>
      </div>

      <HistoryTable
        title="Resources Sent To Charities"
        description="History of resources you shared with other charities"
        charityData={charityData}
        resourceData={resourceData}
        transitData={sentTransitData}
      />

      <HistoryTable
        title="Resources Received From Charities"
        description="History of resources shared to your charity"
        charityData={charityData}
        resourceData={resourceData}
        transitData={receivedTransitData}
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight pt-5">Sales History</h1>
      </div>

      <SalesTable
        charity={charity}
        salesData={salesData}
      />

    </div>
  );
};

const HistoryTable = ({ title, description, charityData, resourceData, transitData} : 
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

const SalesTable = ({charity, salesData} : 
  {charity: CharityData; salesData: Sales[];}
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');

  const [filteredData, setFilteredData] = useState<Sales[]>(salesData);
  const [itemsPerPage] = useState(5);
  const [dateFilter, setDateFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let result = salesData

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((sale) => {
        const categoriesMatch = sale.sales_data?.some(
          (item) => item.category.toLowerCase().includes(query) || item.amount.toString().includes(query),
        )

        const totalAmount = calculateTotal(sale)
        const totalMatch = totalAmount.toString().includes(query)

        return categoriesMatch || totalMatch
      })
    }

    if (dateFilter !== "all") {
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()

      switch (dateFilter) {
        case "thisMonth":
          result = result.filter((sale) => {
            const saleDate = new Date(sale.date)
            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
          })
          break
        case "lastMonth":
          result = result.filter((sale) => {
            const saleDate = new Date(sale.date)
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
            return saleDate.getMonth() === lastMonth && saleDate.getFullYear() === lastMonthYear
          })
          break
        case "thisYear":
          result = result.filter((sale) => {
            const saleDate = new Date(sale.date)
            return saleDate.getFullYear() === currentYear
          })
          break
      }
    }

    setFilteredData(result)
    setCurrentPage(1)
  }, [searchQuery, dateFilter, salesData])

  // Calculate total amount for a sale
  const calculateTotal = (sale: Sales): number => {
    return sale.sales_data?.reduce((sum, item) => sum + item.amount, 0) || 0
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentItems = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredData, totalPages, currentPage]);
  


  // Format currency
  const formatCurrency = (amount: number): string => {
    return `£${amount.toFixed(2)}`
  }

  // Format date for display (keeping the original Date object as requested)
  const formatDateDisplay = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Sales History</CardTitle>
              <CardDescription>Record of all your charity sales</CardDescription>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search sales history..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No sales records found matching your criteria</div>
          ) : (
            <div className="space-y-4">
              {currentItems.map((sale) => (
                <Card key={sale.id} className="overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 md:border-r">
                      <h3 className="font-semibold text-lg">{charity.name}</h3>
                    </div>
                    <div className="p-4 md:border-r">
                      <div className="text-sm text-muted-foreground">Date</div>
                      <div className="font-medium">{formatDateDisplay(sale.date)}</div>
                    </div>
                    <div className="p-4 bg-muted/10">
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                      <div className="font-bold text-lg">{formatCurrency(calculateTotal(sale))}</div>
                    </div>
                  </div>
                  <div className="border-t">
                    <Table>
                      <TableBody>
                        {sale.sales_data?.map((item, index) => (
                          <TableRow key={index} className="hover:bg-muted/5">
                            <TableCell className="font-medium">{item.category}:</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length}{" "}
              sales records
            </div>

            <Pagination className="mt-2">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1),
                  )
                  .map((page, i, array) => {
                    // Add ellipsis if there are gaps in the sequence
                    if (i > 0 && page > array[i - 1] + 1) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(page)
                          }}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryTab;