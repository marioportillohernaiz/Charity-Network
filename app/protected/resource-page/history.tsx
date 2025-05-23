// HISTORY PAGE
// Display resource transit history and sales history for the charity

"use client"

import React, { useEffect, useState } from 'react';
import { BookOpenText, Calendar, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns-tz';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransitStatus } from '@/types/TransitStatus';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ExportTransit } from '@/components/component/export-transit-data';
import { ExportSales } from '@/components/component/export-sales-data';

const HistoryTab = ({charity,charityData,resourceData,transitData,salesData}:{charity: CharityData;charityData: CharityData[];resourceData: ResourcesData[]; transitData:TransitData[];salesData: Sales[];}) => {
  const sentTransitData = transitData.filter(item => item.charity_from === charity.id && (item.status === TransitStatus.RECEIVED || item.status === TransitStatus.REJECTED || item.status === TransitStatus.CANCELLED));
  const receivedTransitData = transitData.filter(item => item.charity_to === charity.id && (item.status === TransitStatus.RECEIVED || item.status === TransitStatus.REJECTED || item.status === TransitStatus.CANCELLED));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sharing History</h1>
      </div>

      {/* Resources Sent To Charities Reusable Component */}
      <HistoryTable
        title="Resources Sent To Charities"
        description="History of resources you shared with other charities"
        charityData={charityData}
        resourceData={resourceData}
        transitData={sentTransitData}
      />

      {/* Resources Received From Charities Reusable Component */}
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

      {/* Sales History Table Component */}
      <SalesTable
        charity={charity}
        salesData={salesData}
      />

    </div>
  );
};

// Transit Table Component
const HistoryTable = ({ title, description, charityData, resourceData, transitData} : 
  {title: string; description: string; charityData: CharityData[]; resourceData: ResourcesData[]; transitData: TransitData[];}
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState('all');
  const [selectedCharity, setSelectedCharity] = useState('all');

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
    <Card className="mb-4 bg-secondary">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <ExportTransit
            transitData={transitData}
            resourceData={resourceData}
            charityData={charityData}
            title={title}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search sharing history..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
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
          {currentItems.length > 0 ? (
            currentItems.map((history) => {
              const charityDetails = charityData.find(
                (charity) => charity.id === (title.includes("Sent To") ? history.charity_to : history.charity_from),
              )

              const resourceDetails = resourceData.find((resource) => resource.id === history.resource_id)

              return (
                <Card key={history.id} className="p-4">
                  <div className="block md:hidden space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-lg">{resourceDetails?.name}</p>
                        <p className="text-gray-500">
                          {history.quantity} {resourceDetails?.unit}
                        </p>
                      </div>
                      <Badge
                        className={
                          history.status === TransitStatus.REJECTED
                            ? "bg-green-200 text-green-800 hover:bg-green-200"
                            : history.status === TransitStatus.CANCELLED
                              ? "bg-red-200 text-red-800 hover:bg-red-200"
                              : "bg-red-200 text-red-800 hover:bg-red-200"
                        }
                      >
                        {history.status === TransitStatus.REJECTED
                          ? "Received"
                          : history.status === TransitStatus.CANCELLED
                            ? "Cancelled"
                            : "Rejected"}
                      </Badge>
                    </div>

                    <div>
                      <p className="font-medium">{charityDetails?.name}</p>
                      <p className="text-sm text-gray-500">{charityDetails?.address || "No address provided"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Time Sent</p>
                        <p className="text-sm">
                          {history.time_sent ? format(history.time_sent, "dd/MM/yyyy hh:mm") : "n/a"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time Received</p>
                        <p className="text-sm">
                          {history.time_received ? format(history.time_received, "dd/MM/yyyy hh:mm") : "n/a"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:grid md:grid-cols-6 md:gap-4">
                    <div className="my-auto">
                      <p className="font-medium text-xl">{resourceDetails?.name}</p>
                      <p className="text-gray-500">
                        {history.quantity} {resourceDetails?.unit}
                      </p>
                    </div>

                    <div className="my-auto col-span-2">
                      <p className="font-medium">{charityDetails?.name}</p>
                      <p className="text-sm text-gray-500">{charityDetails?.address || "No address provided"}</p>
                    </div>

                    <div className="my-auto">
                      <p className="text-sm text-gray-500">Time Sent</p>
                      <p>{history.time_sent ? format(history.time_sent, "dd/MM/yyyy hh:mm") : "n/a"}</p>
                    </div>

                    <div className="my-auto">
                      <p className="text-sm text-gray-500">Time Received</p>
                      <p>{history.time_received ? format(history.time_received, "dd/MM/yyyy hh:mm") : "n/a"}</p>
                    </div>

                    <div className="my-auto">
                      {history.status === TransitStatus.REJECTED ? (
                        <Badge className="bg-green-200 text-green-800 hover:bg-green-200">Received</Badge>
                      ) : history.status === TransitStatus.CANCELLED ? (
                        <Badge className="bg-red-200 text-red-800 hover:bg-red-200">Cancelled</Badge>
                      ) : (
                        <Badge className="bg-red-200 text-red-800 hover:bg-red-200">Rejected</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpenText size={48} className="mx-auto mb-4 opacity-30" />
              <p>No available history</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            Showing{" "}
            {transitData.length > 0 ? Math.min(transitData.length, (currentPage - 1) * ITEMS_PER_PAGE + 1) : 0}-
            {Math.min(currentPage * ITEMS_PER_PAGE, transitData.length)} of {transitData.length} sharing records
          </div>

          {totalPages > 1 && (
            <Pagination className="order-1 sm:order-2">
              <PaginationContent className="flex-wrap justify-center">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(currentPage - 1)
                    }}
                  />
                </PaginationItem>

                {generatePaginationItems().map((page, index, array) => {
                  const isMobileVisible = page === 1 || page === totalPages || page === currentPage

                  if (index > 0 && page > array[index - 1] + 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <PaginationItem className={!isMobileVisible ? "hidden sm:flex" : ""}>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem className={!isMobileVisible ? "hidden sm:flex" : ""}>
                          <PaginationLink
                            href="#"
                            isActive={page === currentPage}
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(page)
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    )
                  }

                  return (
                    <PaginationItem key={page} className={!isMobileVisible ? "hidden sm:flex" : ""}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(page)
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(currentPage + 1)
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

// Sales Table Component
const SalesTable = ({charity, salesData} : {charity: CharityData; salesData: Sales[];}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
  const [searchQuery, setSearchQuery] = useState('');

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
            const saleDate = new Date(sale.date_to)
            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
          })
          break
        case "lastMonth":
          result = result.filter((sale) => {
            const saleDate = new Date(sale.date_to)
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
            return saleDate.getMonth() === lastMonth && saleDate.getFullYear() === lastMonthYear
          })
          break
        case "thisYear":
          result = result.filter((sale) => {
            const saleDate = new Date(sale.date_to)
            return saleDate.getFullYear() === currentYear
          })
          break
      }
    }

    setFilteredData(result)
    setCurrentPage(1)
  }, [searchQuery, dateFilter, salesData]);

  const calculateTotal = (sale: Sales): number => {
    return sale.sales_data?.reduce((sum, item) => sum + item.amount, 0) || 0
  };

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
  
  const formatCurrency = (amount: number): string => {
    return `£${amount.toFixed(2)}`
  };

  const formatDateDisplay = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
      <Card className="shadow-sm bg-secondary">
        <CardHeader className="pb-3 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Sales History</CardTitle>
              <CardDescription>Record of all your charity sales</CardDescription>
            </div>
            <ExportSales salesData={salesData} charity={charity} />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search sales history..."
                className="pl-8 w-full"
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
            <div className="text-center py-8 text-gray-500">
              <BookOpenText size={48} className="mx-auto mb-4 opacity-30" />
              <p>No sales records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentItems.map((sale) => (
                <Card key={sale.id} className="overflow-hidden">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-lg">{charity.name}</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-4 border-b">
                    <div className="p-2">
                      <div className="text-sm text-muted-foreground">Date From</div>
                      <div className="font-medium">{formatDateDisplay(sale.date_from)}</div>
                    </div>
                    <div className="p-2">
                      <div className="text-sm text-muted-foreground">Date To</div>
                      <div className="font-medium">{formatDateDisplay(sale.date_to)}</div>
                    </div>
                    <div className="p-2 sm:col-span-2 md:col-span-1 mt-2 sm:mt-0 bg-muted/10 rounded-md">
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                      <div className="font-bold text-lg">{formatCurrency(calculateTotal(sale))}</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableBody>
                        {sale.sales_data?.map((item, index) => (
                          <TableRow key={index} className="hover:bg-muted/5">
                            <TableCell className="font-medium whitespace-nowrap">{item.category}:</TableCell>
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

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
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
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (window.innerWidth < 640
                        ? page === currentPage
                        : page >= currentPage - 1 && page <= currentPage + 1),
                  )
                  .map((page, i, array) => {
                    if (i > 0 && page > array[i - 1] + 1) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`} className="hidden sm:inline-flex">
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