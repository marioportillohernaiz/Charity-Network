"use client"

import React, { useState } from 'react';
import { Plus, ArrowUpDown, Package2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const OverviewTab = ({resourceData}:{resourceData: ResourcesData[]}) => {

  // Sample data for the charts
  const resourceData1 = [
    { name: 'Food', value: 650 },
    { name: 'Clothing', value: 230 },
    { name: 'Medical', value: 145 },
    { name: 'Education', value: 95 },
    { name: 'Hygiene', value: 85 }
  ];

  const monthlyTrendsData = [
    { name: 'Jan', resources: 980, requests: 18 },
    { name: 'Feb', resources: 1040, requests: 21 },
    { name: 'Mar', resources: 1100, requests: 19 },
    { name: 'Apr', resources: 1180, requests: 22 },
    { name: 'May', resources: 1220, requests: 20 },
    { name: 'Jun', resources: 1300, requests: 24 },
    { name: 'Jul', resources: 1234, requests: 23 }
  ];

  const requestsData = [
    { id: 1, charity: 'Hope Foundation', resource: 'Winter Coats', quantity: 50, urgency: 'High', status: 'Pending' },
    { id: 2, charity: 'Care Center', resource: 'Canned Food', quantity: 200, urgency: 'Medium', status: 'Approved' },
    { id: 3, charity: 'Help Network', resource: 'Medical Supplies', quantity: 30, urgency: 'High', status: 'Pending' },
    { id: 4, charity: 'Education First', resource: 'School Supplies', quantity: 100, urgency: 'Low', status: 'Fulfilled' },
    { id: 5, charity: 'Community Aid', resource: 'Hygiene Kits', quantity: 75, urgency: 'Medium', status: 'Approved' }
  ];

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const getUrgencyBadge = (urgency: string) => {
    switch(urgency) {
      case 'High':
        return <Badge className="bg-red-500">High</Badge>;
      case 'Medium':
        return <Badge className="bg-blue-600">Medium</Badge>;
      case 'Low':
        return <Badge className="bg-gray-500">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'Approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'Fulfilled':
        return <Badge className="bg-blue-400">Fulfilled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <>
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-white hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
          <Package2 className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <div className="flex items-center mt-1">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+20.1%</Badge>
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
          <div className="text-2xl font-bold">23</div>
          <div className="flex items-center mt-1">
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">12 new</Badge>
            <span className="text-xs text-muted-foreground ml-1">requests this week</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resources Shared</CardTitle>
          <Plus className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">432</div>
          <div className="flex items-center mt-1">
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">15</Badge>
            <span className="text-xs text-muted-foreground ml-1">partner charities</span>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <div className="grid gap-4 md:grid-cols-2 mt-4">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Resource Distribution</CardTitle>
          <CardDescription>Current distribution of resources by category</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={resourceData1}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {resourceData1.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} items`, 'Quantity']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>Resources and requests over time</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="resources" name="Resources" fill="#0088FE" />
              <Bar yAxisId="right" dataKey="requests" name="Requests" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
    
    <Card className="bg-white mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Requests</CardTitle>
          <CardDescription>Latest resource requests from other charities</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requestsData.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.charity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.resource}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getUrgencyBadge(request.urgency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card></>
  );
};

export default OverviewTab;