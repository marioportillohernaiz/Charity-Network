// OVERVIEW TAB COMPONENT
// This component is responsible for displaying an overview of the resources, requests, and sales data.

"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Package2, CalendarClock, Share2, ChartPie } from 'lucide-react';
import { Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, parse } from 'date-fns';

const useMobileDetect = () => {
  const [isMobileState, setIsMobileState] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobileState(/Mobi|Android/i.test(navigator.userAgent));
    }
  }, []);
  
  return { isMobile: () => isMobileState };
};

const OverviewTab = ({ resourceData, requestData, charity, salesData }: { resourceData: ResourcesData[], requestData?: TransitData[]; charity: CharityData; salesData: Sales[] }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];
  const detectMobile = useMobileDetect();
  
  const totalResources = useMemo(() => resourceData.reduce((sum, resource) => sum + resource.quantity, 0), [resourceData]);
  const totalShareable = useMemo(() => resourceData.reduce((sum, resource) => sum + resource.shareable_quantity, 0), [resourceData]);
  const totalReserved = useMemo(() => resourceData.reduce((sum, resource) => sum + resource.quantity_reserved, 0), [resourceData]);
  const totalAvailable = useMemo(() => totalResources - totalReserved - totalShareable, [totalResources, totalReserved, totalShareable]);

  const resourceDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    
    resourceData.forEach(resource => {
      if (!distribution[resource.category]) {
        distribution[resource.category] = 0;
      }
      distribution[resource.category] += resource.quantity;
    });
    
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      color: COLORS[name.length % COLORS.length] || '#d53e4f'
    })).sort((a, b) => b.value - a.value);
  }, [resourceData]);

  const resourceAllocationData = useMemo(() => [
    { name: 'Available', value: totalAvailable, color: '#00C49F' },
    { name: 'Reserved', value: totalReserved, color: '#A83632' },
    { name: 'Shareable', value: totalShareable, color: '#0088FE' }
  ], [totalAvailable, totalReserved, totalShareable]);

  const expiringResourcesCount = useMemo(() => {
    return resourceData.filter(resource => {
      if (!resource.expiry_date) return false;
      const expiryDate = new Date(resource.expiry_date);
      const today = new Date();
      const diffDays = differenceInDays(expiryDate, today);
      return diffDays >= 0 && diffDays <= 30;
    }).length;
  }, [resourceData]);

  const formatCurrency = (amount: number): string => {
    return `£${amount.toFixed(2)}`
  }
  
  const [allCategoryData, setAllCategoryData] = useState<Record<string, any[]>>({});
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    const salesByMonth: Record<string, Record<string, number>> = {}
    const months: Set<string> = new Set()
    
    // Process all sales
    salesData.forEach((sale) => {
      const date = new Date(sale.date_to)
      const monthYear = format(date, 'MMM yyyy')
      months.add(monthYear)
      
      if (!salesByMonth[monthYear]) {
        salesByMonth[monthYear] = {}
      }
      
      sale.sales_data?.forEach((item) => {
        if (salesByMonth[monthYear][item.category]) {
          salesByMonth[monthYear][item.category] += item.amount
        } else {
          salesByMonth[monthYear][item.category] = item.amount
        }
      })
    })
    
    const sortedMonths = Array.from(months).sort((a, b) => {
      const dateA = parse(a, 'MMM yyyy', new Date())
      const dateB = parse(b, 'MMM yyyy', new Date())
      return dateB.getTime() - dateA.getTime()
    })
    
    setAvailableMonths(sortedMonths)
    
    const allMonthsData: Record<string, number> = {}
    const chartDataByMonth: Record<string, any[]> = {}

    Object.values(salesByMonth).forEach(monthData => {
      Object.entries(monthData).forEach(([category, amount]) => {
        if (allMonthsData[category]) {
          allMonthsData[category] += amount
        } else {
          allMonthsData[category] = amount
        }
      })
    })
    
    Object.entries(salesByMonth).forEach(([month, categories]) => {
      const monthData = Object.entries(categories).map(([category, amount]) => ({
        category,
        amount,
        fill: "#064789",
      })).sort((a, b) => b.amount - a.amount)
      
      chartDataByMonth[month] = monthData
    })
    
    const allData = Object.entries(allMonthsData).map(([category, amount]) => ({
      category,
      amount,
      fill: "#064789",
    })).sort((a, b) => b.amount - a.amount)
    
    chartDataByMonth['all'] = allData
    setAllCategoryData(chartDataByMonth)
    
    if (selectedMonth && chartDataByMonth[selectedMonth]) {
      setCategoryData(chartDataByMonth[selectedMonth])
    } else if (sortedMonths.length > 0) {
      setCategoryData(chartDataByMonth[sortedMonths[0]])
    } else {
      setCategoryData(allData)
    }
    
  }, [salesData])
  
  useEffect(() => {
    if (selectedMonth && allCategoryData[selectedMonth]) {
      setCategoryData(allCategoryData[selectedMonth])
    } else if (selectedMonth === 'all' && allCategoryData['all']) {
      setCategoryData(allCategoryData['all'])
    }
  }, [selectedMonth, allCategoryData])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Cards Displaying key resource information */}
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Package2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResources.toLocaleString()}</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-red-100 text-red-800 hover:bg-green-100">
                0%
              </Badge>
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requestData 
                ? requestData.filter(r => (r.status === 'Requested' || r.status === 'In transit') && (r.charity_from === charity.id || r.charity_to === charity.id)).length 
                : 0}
            </div>
            <div className="flex items-center mt-1">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                {requestData 
                  ? requestData.filter(r => r.status === 'Requested' && (r.charity_from === charity.id || r.charity_to === charity.id)).length 
                  : 0} new
              </Badge>
              <span className="text-xs text-muted-foreground ml-1">pending requests</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shareable Resources</CardTitle>
            <Share2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShareable.toLocaleString()}</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                {totalShareable > 0 ? Math.round((totalShareable / totalResources) * 100) : 0}%
              </Badge>
              <span className="text-xs text-muted-foreground ml-1">of total inventory</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <CalendarClock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringResourcesCount}</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">30days</Badge>
              <span className="text-xs text-muted-foreground ml-1">or less remaining</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Types of Resource Categories */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Resource Distribution</CardTitle>
            <CardDescription>Current distribution of resources by category</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {resourceDistribution.length > 0 ? (
                <PieChart>
                  <Pie
                    data={resourceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => {
                      return `${name}\n${(percent * 100).toFixed(0)}%`;
                    }}
                  >
                    {resourceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} items`, 'Quantity']}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 border shadow-sm rounded-md">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm">{data.value} items ({(data.value / totalResources * 100).toFixed(1)}%)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              ) : (
                <div className="text-center grid h-full place-content-center text-gray-500">
                  <ChartPie size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No data available</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Resource Allocation Chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Resource Allocation</CardTitle>
            <CardDescription>How your resources are currently allocated</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {totalResources > 0 ? (
                <PieChart>
                  <Pie
                    data={resourceAllocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {resourceAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} items`, 'Quantity']}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 border shadow-sm rounded-md">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm">{data.value} items ({(data.value / totalResources * 100).toFixed(1)}%)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              ) : (
                <div className="text-center grid h-full place-content-center text-gray-500">
                  <ChartPie size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No data available</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader className="flex flex-col space-y-2 pb-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Breakdown of sales across categories</CardDescription>
          </div>
          {availableMonths.length > 0 && (
            <div className="w-full sm:w-auto">
              <div className="flex flex-wrap items-center rounded-md border bg-background p-1 text-sm">
                <button
                  onClick={() => setSelectedMonth("all")}
                  className={`mb-1 mr-1 rounded-sm px-2 py-0.5 sm:mb-0 ${
                    selectedMonth === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  All Time
                </button>
                <div className={`flex ${detectMobile.isMobile() ? "flex-wrap" : "overflow-x-auto"}`}>
                  {availableMonths.map((month) => (
                    <button
                      key={month}
                      onClick={() => setSelectedMonth(month)}
                      className={`mb-1 mr-1 rounded-sm px-2 py-0.5 sm:mb-0 ${
                        selectedMonth === month
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className={`${detectMobile.isMobile() ? "h-[350px]" : "h-[500px]"}`}>
            <ResponsiveContainer width="100%" height="100%">
              {categoryData && categoryData.length > 0 ? (
                <BarChart
                  data={categoryData}
                  margin={{
                    top: 20,
                    right: detectMobile.isMobile() ? 20 : 40,
                    left: 0,
                    bottom: 0,
                  }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: detectMobile.isMobile() ? 10 : 12 }} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={detectMobile.isMobile() ? 100 : 150}
                    tick={{ fontSize: detectMobile.isMobile() ? 10 : 12 }}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `Category: ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: detectMobile.isMobile() ? 10 : 12 }} />
                  <Bar dataKey="amount" name="Amount" fill="#0f4c81" radius={[0, 4, 4, 0]} />
                </BarChart>
              ) : (
                <div className="text-center grid h-full place-content-center text-gray-500">
                  <ChartPie size={detectMobile.isMobile() ? 36 : 48} className="mx-auto mb-4 opacity-30" />
                  <p>No data available</p>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;