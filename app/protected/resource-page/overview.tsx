"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Package2, CalendarClock, Share2 } from 'lucide-react';
import { Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, subMonths, differenceInDays, parse } from 'date-fns';

const chartColors = [
  "#4f46e5", // indigo
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
]

const OverviewTab = ({ resourceData, requestData, charity, salesData }: { resourceData: ResourcesData[], requestData?: TransitData[]; charity: CharityData; salesData: Sales[] }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

  // Calculate total resource statistics
  const totalResources = useMemo(() => resourceData.reduce((sum, resource) => sum + resource.quantity, 0), [resourceData]);
  const totalShareable = useMemo(() => resourceData.reduce((sum, resource) => sum + resource.shareable_quantity, 0), [resourceData]);
  const totalReserved = useMemo(() => resourceData.reduce((sum, resource) => sum + resource.quantity_reserved, 0), [resourceData]);
  const totalAvailable = useMemo(() => totalResources - totalReserved - totalShareable, [totalResources, totalReserved, totalShareable]);

  // Calculate resource distribution by category
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

  // Generate monthly trends data (mocked based on current data)
  const monthlyTrendsData = useMemo(() => {
    const today = new Date();
    const result = [];
    
    // Get an array of last 6 months
    for (let i = 6; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthName = format(monthDate, 'MMM');
      
      // Simulate resource and request numbers based on the current data
      // In a real app, this would come from historical data
      const baseResources = totalResources * (0.85 + Math.random() * 0.3);
      const baseRequests = requestData ? requestData.length * (0.7 + Math.random() * 0.6) : 15 + Math.round(Math.random() * 10);
      
      // For the current month, use actual numbers
      if (i === 0) {
        result.push({
          name: monthName,
          resources: totalResources,
          requests: requestData ? requestData.filter(r => r.status === 'Pending' || r.status === 'Approved').length : baseRequests,
          shareablePercentage: Math.round((totalShareable / totalResources) * 100)
        });
      } else {
        result.push({
          name: monthName,
          resources: Math.round(baseResources * (1 - i * 0.03)),
          requests: Math.round(baseRequests * (1 - i * 0.04)),
          shareablePercentage: Math.round(((totalShareable / totalResources) * (0.9 + Math.random() * 0.2)) * 100)
        });
      }
    }
    
    return result;
  }, [totalResources, totalShareable, requestData]);

  // Calculate resource allocation data
  const resourceAllocationData = useMemo(() => [
    { name: 'Available', value: totalAvailable, color: '#00C49F' },
    { name: 'Reserved', value: totalReserved, color: '#A83632' },
    { name: 'Shareable', value: totalShareable, color: '#0088FE' }
  ], [totalAvailable, totalReserved, totalShareable]);

  // Find expiring resources
  const expiringResourcesCount = useMemo(() => {
    return resourceData.filter(resource => {
      if (!resource.expiry_date) return false;
      const expiryDate = new Date(resource.expiry_date);
      const today = new Date();
      const diffDays = differenceInDays(expiryDate, today);
      return diffDays >= 0 && diffDays <= 30;
    }).length;
  }, [resourceData]);

  // Calculate month-over-month change
  const monthOverMonthChange = useMemo(() => {
    if (monthlyTrendsData.length < 2) return 0;
    const currentMonth = monthlyTrendsData[monthlyTrendsData.length - 1].resources;
    const previousMonth = monthlyTrendsData[monthlyTrendsData.length - 2].resources;
    return previousMonth === 0 ? 100 : Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
  }, [monthlyTrendsData]);

  const formatCurrency = (amount: number): string => {
    return `£${amount.toFixed(2)}`
  }
  
  // State for all category data and filtered data
  const [allCategoryData, setAllCategoryData] = useState<Record<string, any[]>>({});
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  // const [monthlySalesData, setMonthlySalesData] = useState<any[]>([]);

  // Process sales data by category and month
  useEffect(() => {
    // Create an object to store sales by month and category
    const salesByMonth: Record<string, Record<string, number>> = {}
    const months: Set<string> = new Set()
    
    // Process all sales
    salesData.forEach((sale) => {
      const date = new Date(sale.date)
      const monthYear = format(date, 'MMM yyyy')
      
      // Add to available months
      months.add(monthYear)
      
      // Initialize month if not exists
      if (!salesByMonth[monthYear]) {
        salesByMonth[monthYear] = {}
      }
      
      // Add sales data for this month
      sale.sales_data?.forEach((item) => {
        if (salesByMonth[monthYear][item.category]) {
          salesByMonth[monthYear][item.category] += item.amount
        } else {
          salesByMonth[monthYear][item.category] = item.amount
        }
      })
    })
    
    // Create arrays of available months (sorted chronologically)
    const sortedMonths = Array.from(months).sort((a, b) => {
      const dateA = parse(a, 'MMM yyyy', new Date())
      const dateB = parse(b, 'MMM yyyy', new Date())
      return dateB.getTime() - dateA.getTime() // Most recent first
    })
    
    setAvailableMonths(sortedMonths)
    
    // Create aggregate data for all months combined
    const allMonthsData: Record<string, number> = {}
    
    Object.values(salesByMonth).forEach(monthData => {
      Object.entries(monthData).forEach(([category, amount]) => {
        if (allMonthsData[category]) {
          allMonthsData[category] += amount
        } else {
          allMonthsData[category] = amount
        }
      })
    })
    
    // Convert to array format for charts
    const chartDataByMonth: Record<string, any[]> = {}
    
    // Process each month's data
    Object.entries(salesByMonth).forEach(([month, categories]) => {
      const monthData = Object.entries(categories).map(([category, amount]) => ({
        category,
        amount,
        fill: "#064789",
      })).sort((a, b) => b.amount - a.amount)
      
      chartDataByMonth[month] = monthData
    })
    
    // Process all months combined
    const allData = Object.entries(allMonthsData).map(([category, amount]) => ({
      category,
      amount,
      fill: "#064789",
    })).sort((a, b) => b.amount - a.amount)
    
    // Store all data
    chartDataByMonth['all'] = allData
    
    setAllCategoryData(chartDataByMonth)
    
    // Set initial display data
    if (selectedMonth && chartDataByMonth[selectedMonth]) {
      setCategoryData(chartDataByMonth[selectedMonth])
    } else if (sortedMonths.length > 0) {
      setCategoryData(chartDataByMonth[sortedMonths[0]])
    } else {
      setCategoryData(allData)
    }
    
  }, [salesData])
  
  // Update displayed data when month selection changes
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
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Package2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResources.toLocaleString()}</div>
            <div className="flex items-center mt-1">
              <Badge className={`${monthOverMonthChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} hover:bg-green-100`}>
                {monthOverMonthChange >= 0 ? '+' : ''}{monthOverMonthChange}%
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
                ? requestData.filter(r => r.status === 'Requested' || r.status === 'In transit').length 
                : 0}
            </div>
            <div className="flex items-center mt-1">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                {requestData 
                  ? requestData.filter(r => r.status === 'Requested').length 
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
                {Math.round((totalShareable / totalResources) * 100)}%
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
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">30 days</Badge>
              <span className="text-xs text-muted-foreground ml-1">or less remaining</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Resource Distribution</CardTitle>
            <CardDescription>Current distribution of resources by category</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
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
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Resource Allocation</CardTitle>
            <CardDescription>How your resources are currently allocated</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
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
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Breakdown of sales across categories</CardDescription>
          </div>
          <div className="flex space-x-1">
            {availableMonths.length > 0 && (
              <div className="flex items-center rounded-md border bg-background p-1 text-sm">
                <button
                  onClick={() => setSelectedMonth('all')}
                  className={`rounded-sm px-2.5 py-0.5 ${
                    selectedMonth === 'all' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  All Time
                </button>
                {availableMonths.map((month) => (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className={`rounded-sm px-2.5 py-0.5 ${
                      selectedMonth === month 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={categoryData} 
                margin={{ top: 20, right: 40, left: 0, bottom: 0 }} 
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tickFormatter={formatCurrency} />
                <YAxis 
                  dataKey="category" 
                  type="category" 
                  width={150}
                  tick={{ fontSize: 12 }} 
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(label) => `Category: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="amount" 
                  name="Amount" 
                  fill="#0f4c81" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Monthly Sales Trends</CardTitle>
              <CardDescription>Track sales performance over time</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" angle={0} textAnchor="middle" height={40} tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  {/* Dynamically create bars for each sales category */}
                  {Array.from(
                    new Set(categoryData.flatMap((item) => Object.keys(item).filter((key) => key !== "month"))),
                  ).map((category, index) => (
                    <Bar
                      key={category}
                      dataKey={category}
                      name={category}
                      stackId="a"
                      fill={chartColors[index % chartColors.length]}
                      radius={index === 0 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default OverviewTab;