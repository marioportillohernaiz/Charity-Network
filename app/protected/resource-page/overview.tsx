"use client"

import React, { useMemo } from 'react';
import { ArrowUpDown, Package2, CalendarClock, Share2 } from 'lucide-react';
import { Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, subMonths, differenceInDays } from 'date-fns';

const OverviewTab = ({ resourceData, requestData, charity }: { resourceData: ResourcesData[], requestData?: TransitData[]; charity: CharityData }) => {
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

  // Utility functions for badges
  const getUrgencyBadge = (urgency: string) => {
    switch(urgency) {
      case 'High':
        return <Badge className="bg-red-500 text-white">High</Badge>;
      case 'Medium':
        return <Badge className="bg-blue-600 text-white">Medium</Badge>;
      case 'Low':
        return <Badge className="bg-gray-500 text-white">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

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
                  labelLine={false}
                  outerRadius={60}
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
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resourceAllocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={60}
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
    </div>
  );
};

export default OverviewTab;