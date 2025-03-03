"use client"

import React, { useState } from 'react';
import { Search, Clock, CheckCircle, AlertTriangle, MoreHorizontal, XCircle, ArrowUpDown, Download, MessageSquare, CheckSquare, Link, Eye, Truck, MapPin, Calendar, Package, BarChart4 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const RequestsTab = ({resourceData}:{resourceData: ResourcesData[]}) => {
  // Define the Request type with transit information
  type Transit = {
    id: number;
    resourceId: number;
    fromCharityId: number;
    toCharityId: number;
    quantity: number;
    status: 'in store' | 'in transit' | 'received';
    timeSent?: string;
    timeReceived?: string;
    estimatedDelivery?: string;
    trackingInfo?: string;
    updatedAt: string;
  };

  type Request = {
    id: number;
    charity: string;
    charityLogo?: string;
    resource: string;
    quantity: number;
    urgency: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
    date: string;
    description?: string;
    contactPerson?: string;
    contactEmail?: string;
    fulfillmentProgress?: number;
    notes?: string[];
    transits?: Transit[]; // Added transit information
    estimatedDelivery?: string;
    matchingResourcesAvailable?: number;
  };

  // Sample data
  const [requests, setRequests] = useState<Request[]>([
    { 
      id: 1, 
      charity: "Hope Foundation", 
      charityLogo: "/api/placeholder/30/30",
      resource: "Winter Coats", 
      quantity: 50, 
      urgency: "High", 
      status: "Pending", 
      date: "2024-02-22",
      description: "Need warm winter coats for our homeless outreach program as temperatures are dropping.",
      contactPerson: "Maria Chen",
      contactEmail: "mchen@hopefoundation.org",
      notes: ["Requested sizes: 20 S, 20 M, 10 L", "Preferably waterproof"],
      matchingResourcesAvailable: 35
    },
    { 
      id: 2, 
      charity: "Care Center", 
      charityLogo: "/api/placeholder/30/30",
      resource: "Canned Food", 
      quantity: 200, 
      urgency: "Medium", 
      status: "Approved", 
      date: "2024-02-21",
      description: "Monthly food bank supply for community distribution.",
      contactPerson: "James Wilson",
      contactEmail: "jwilson@carecenter.org",
      fulfillmentProgress: 40,
      notes: ["No expired items", "Preference for vegetables and proteins"],
      transits: [
        {
          id: 101,
          resourceId: 5,
          fromCharityId: 1,
          toCharityId: 2,
          quantity: 80,
          status: 'in transit',
          timeSent: '2024-02-23T14:30:00',
          estimatedDelivery: '2024-02-25',
          trackingInfo: 'TRK12345678',
          updatedAt: '2024-02-23T14:30:00'
        }
      ],
      estimatedDelivery: "2024-02-25"
    },
    { 
      id: 3, 
      charity: "Help Network", 
      charityLogo: "/api/placeholder/30/30",
      resource: "Medical Supplies", 
      quantity: 30, 
      urgency: "High", 
      status: "Pending", 
      date: "2024-02-20",
      description: "Basic medical supplies for our free clinic serving uninsured patients.",
      contactPerson: "Sarah Ahmed",
      contactEmail: "sahmed@helpnetwork.org",
      matchingResourcesAvailable: 30
    },
    { 
      id: 4, 
      charity: "Education First", 
      charityLogo: "/api/placeholder/30/30",
      resource: "School Supplies", 
      quantity: 100, 
      urgency: "Low", 
      status: "Completed", 
      date: "2024-02-19",
      description: "School supplies for our back-to-school program for underprivileged children.",
      contactPerson: "Robert Johnson",
      contactEmail: "rjohnson@educationfirst.org",
      fulfillmentProgress: 100,
      notes: ["Thank you for helping our students!"],
      transits: [
        {
          id: 102,
          resourceId: 8,
          fromCharityId: 1,
          toCharityId: 4,
          quantity: 100,
          status: 'received',
          timeSent: '2024-02-20T09:15:00',
          timeReceived: '2024-02-22T13:45:00',
          updatedAt: '2024-02-22T13:45:00'
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeView, setActiveView] = useState('all');
  const [showTransitInfo, setShowTransitInfo] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Request; direction: 'asc' | 'desc' }>({ 
    key: 'date', 
    direction: 'desc' 
  });

  // Filter requests based on search, filters, and active view
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.charity.toLowerCase().includes(searchTerm.toLowerCase()) || 
      request.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.description && request.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesUrgency = selectedUrgency === 'All' || request.urgency === selectedUrgency;
    const matchesStatus = selectedStatus === 'All' || request.status === selectedStatus;
    
    // Filter by active view tab
    const matchesView = 
      activeView === 'all' || 
      (activeView === 'pending' && request.status === 'Pending') ||
      (activeView === 'approved' && request.status === 'Approved') ||
      (activeView === 'completed' && request.status === 'Completed') ||
      (activeView === 'in-transit' && request.transits && request.transits.some(t => t.status === 'in transit'));
    
    return matchesSearch && matchesUrgency && matchesStatus && matchesView;
  });

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue! < bValue!) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue! > bValue!) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Handle sorting
  const requestSort = (key: keyof Request) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get urgency badge
  const getUrgencyBadge = (urgency: string) => {
    switch(urgency) {
      case 'High':
        return <Badge className="bg-red-500 text-white">High</Badge>;
      case 'Medium':
        return <Badge className="bg-blue-600 text-white">Medium</Badge>;
      case 'Low':
        return <Badge className="bg-gray-500 text-white">Low</Badge>;
      default:
        return <Badge>{urgency}</Badge>;
    }
  };

  // Get status badge and icon
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Pending':
        return (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-yellow-500 mr-1" />
            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
          </div>
        );
      case 'Approved':
        return (
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <Badge className="bg-green-100 text-green-800">Approved</Badge>
          </div>
        );
      case 'Completed':
        return (
          <div className="flex items-center">
            <CheckSquare className="h-4 w-4 text-blue-500 mr-1" />
            <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
          </div>
        );
      case 'Rejected':
        return (
          <div className="flex items-center">
            <XCircle className="h-4 w-4 text-red-500 mr-1" />
            <Badge className="bg-red-100 text-red-800">Rejected</Badge>
          </div>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get transit status badge and icon
  const getTransitStatusBadge = (status: string) => {
    switch(status) {
      case 'in store':
        return (
          <div className="flex items-center">
            <Package className="h-4 w-4 text-gray-500 mr-1" />
            <Badge className="bg-gray-100 text-gray-800">Preparing</Badge>
          </div>
        );
      case 'in transit':
        return (
          <div className="flex items-center">
            <Truck className="h-4 w-4 text-blue-500 mr-1" />
            <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
          </div>
        );
      case 'received':
        return (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-green-500 mr-1" />
            <Badge className="bg-green-100 text-green-800">Delivered</Badge>
          </div>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get action button based on status
  const getActionButton = (request: Request) => {
    switch(request.status) {
      case 'Pending':
        return (
          <Button 
            variant="outline" 
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
          >
            Review
          </Button>
        );
      case 'Approved':
        if (request.transits && request.transits.some(t => t.status === 'in transit')) {
          return (
            <Button 
              variant="outline" 
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
              onClick={() => setShowTransitInfo(showTransitInfo === request.id ? null : request.id)}
            >
              <Truck className="mr-2 h-4 w-4" />
              {showTransitInfo === request.id ? "Hide Tracking" : "Track Shipment"}
            </Button>
          );
        }
        return (
          <Button 
            variant="outline" 
            className="bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
          >
            View
          </Button>
        );
      case 'Completed':
      case 'Rejected':
        return (
          <Button 
            variant="outline" 
            className="bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
          >
            View
          </Button>
        );
      default:
        return (
          <Button variant="outline">
            View
          </Button>
        );
    }
  };

  // Calculate statistics
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const completedCount = requests.filter(r => r.status === 'Completed').length;
  const highUrgencyCount = requests.filter(r => r.urgency === 'High' && r.status === 'Pending').length;
  const inTransitCount = requests.filter(r => r.transits && r.transits.some(t => t.status === 'in transit')).length;

  // Calculate average response time (example metric)
  const averageResponseTime = "1.8 days";

  return (
    <div className="space-y-4">
      {/* Stats Overview Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold">{requests.length}</p>
            </div>
            <div className="p-2 rounded-full bg-blue-50">
              <AlertTriangle className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
            <div className="p-2 rounded-full bg-yellow-50">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-bold">{approvedCount}</p>
            </div>
            <div className="p-2 rounded-full bg-green-50">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">In Transit</p>
              <p className="text-2xl font-bold">{inTransitCount}</p>
            </div>
            <div className="p-2 rounded-full bg-blue-50">
              <Truck className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
              <p className="text-2xl font-bold">{averageResponseTime}</p>
            </div>
            <div className="p-2 rounded-full bg-purple-50">
              <BarChart4 className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <div>
              <CardTitle className="text-2xl font-bold">All Requests</CardTitle>
              <CardDescription>View and manage resource requests from other charities</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Tabs 
              value={activeView} 
              onValueChange={setActiveView} 
              className="w-full sm:w-auto space-y-2 sm:space-y-0"
            >
              <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="in-transit">In Transit</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>

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
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
              >
                <option value="All">All Urgencies</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              
              <select 
                className="bg-white border rounded-md px-3 py-1 text-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
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
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('charity')}
                    >
                      <div className="flex items-center">
                        Charity
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('resource')}
                    >
                      <div className="flex items-center">
                        Resource
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('quantity')}
                    >
                      <div className="flex items-center">
                        Quantity
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('urgency')}
                    >
                      <div className="flex items-center">
                        Urgency
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRequests.map(request => (
                    <React.Fragment key={request.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">{request.charity}</div>
                              {request.contactPerson && (
                                <div className="text-xs text-gray-500">{request.contactPerson}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{request.resource}</div>
                          {request.description && (
                            <div className="text-xs text-gray-500 max-w-xs truncate">{request.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.quantity.toLocaleString()}</div>
                          {request.status === 'Pending' && request.matchingResourcesAvailable !== undefined && (
                            <div className="text-xs text-green-600">
                              {request.matchingResourcesAvailable} available to match
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getUrgencyBadge(request.urgency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(request.status)}
                          {request.fulfillmentProgress !== undefined && (
                            <div className="mt-1 w-24">
                              <Progress value={request.fulfillmentProgress} className="h-2" />
                              <div className="text-xs text-gray-500 mt-1">{request.fulfillmentProgress}% Fulfilled</div>
                            </div>
                          )}
                          {request.estimatedDelivery && (
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              Est. delivery: {formatDate(request.estimatedDelivery)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {getActionButton(request)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Contact Charity
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Link className="mr-2 h-4 w-4" />
                                  Copy Request Link
                                </DropdownMenuItem>
                                {request.status === 'Pending' && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-green-600">
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Approve Request
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Reject Request
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {request.transits && request.transits.length > 0 && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setShowTransitInfo(showTransitInfo === request.id ? null : request.id)}>
                                      <Truck className="mr-2 h-4 w-4" />
                                      {showTransitInfo === request.id ? "Hide Shipment Details" : "View Shipment Details"}
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                      {/* Transit/Shipment Details Expandable Row */}
                      {showTransitInfo === request.id && request.transits && request.transits.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="border border-blue-200 rounded-md bg-blue-50 p-4">
                              <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                                <Truck className="h-4 w-4 mr-2" />
                                Shipment Details
                              </h4>
                              {request.transits.map((transit, index) => (
                                <div key={transit.id} className="mb-4 last:mb-0">
                                  <div className="flex justify-between mb-2">
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium">Shipment #{index + 1}</span>
                                      <span className="ml-2">{getTransitStatusBadge(transit.status)}</span>
                                    </div>
                                    <div className="text-sm">
                                      {transit.quantity} units
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {transit.timeSent && (
                                      <div className="text-sm">
                                        <span className="text-gray-500 block text-xs">Sent:</span>
                                        {formatDate(transit.timeSent)} at {formatTime(transit.timeSent)}
                                      </div>
                                    )}
                                    
                                    {transit.timeReceived && (
                                      <div className="text-sm">
                                        <span className="text-gray-500 block text-xs">Received:</span>
                                        {formatDate(transit.timeReceived)} at {formatTime(transit.timeReceived)}
                                      </div>
                                    )}
                                    
                                    {transit.estimatedDelivery && !transit.timeReceived && (
                                      <div className="text-sm">
                                        <span className="text-gray-500 block text-xs">Estimated Delivery:</span>
                                        {formatDate(transit.estimatedDelivery)}
                                      </div>
                                    )}
                                    
                                    {transit.trackingInfo && (
                                      <div className="text-sm">
                                        <span className="text-gray-500 block text-xs">Tracking Number:</span>
                                        <span className="font-mono">{transit.trackingInfo}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Shipment Timeline */}
                                  <div className="mt-3 relative">
                                    <div className="flex items-center space-x-2">
                                      <div className={`h-2 w-2 rounded-full ${transit.status === 'in store' || transit.status === 'in transit' || transit.status === 'received' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                      <div className="text-xs">Preparing</div>
                                      <div className={`h-0.5 w-12 ${transit.status === 'in transit' || transit.status === 'received' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                      <div className={`h-2 w-2 rounded-full ${transit.status === 'in transit' || transit.status === 'received' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                      <div className="text-xs">In Transit</div>
                                      <div className={`h-0.5 w-12 ${transit.status === 'received' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                      <div className={`h-2 w-2 rounded-full ${transit.status === 'received' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                      <div className="text-xs">Delivered</div>
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="mt-3 flex justify-end space-x-2">
                                    {transit.status === 'in transit' && (
                                      <Button size="sm" variant="outline" className="text-xs">
                                        View Map
                                      </Button>
                                    )}
                                    <Button size="sm" variant="outline" className="text-xs">
                                      {transit.status === 'received' ? 'View Receipt' : 'View Details'}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {filteredRequests.length} of {requests.length} requests
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-blue-50">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Matching Card */}
      <Card className="bg-white border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Available Resource Matches
          </CardTitle>
          <CardDescription>Pending requests that match your available resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requests
              .filter(r => r.status === 'Pending' && r.matchingResourcesAvailable !== undefined && r.matchingResourcesAvailable > 0)
              .map(request => (
                <div key={request.id} className="flex justify-between items-center p-3 border border-green-100 rounded-md bg-green-50">
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium">{request.charity} · {request.resource}</div>
                      <div className="text-sm text-gray-500">Requested: {request.quantity} · {request.matchingResourcesAvailable} available to share</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      className="bg-white text-green-600 hover:bg-green-50 border border-green-200"
                      variant="outline"
                    >
                      Offer Resources
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* High Priority Requests Card */}
      {highUrgencyCount > 0 && (
        <Card className="bg-white border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              High Priority Requests
            </CardTitle>
            <CardDescription>These requests need your immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests
                .filter(r => r.urgency === 'High' && r.status === 'Pending')
                .map(request => (
                  <div key={request.id} className="flex justify-between items-center p-3 border border-red-100 rounded-md bg-red-50">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium">{request.charity} · {request.resource}</div>
                        <div className="text-sm text-gray-500">Qty: {request.quantity} · Requested on {request.date}</div>
                      </div>
                    </div>
                    <Button 
                      className="bg-white text-red-600 hover:bg-red-50 border border-red-200"
                      variant="outline"
                    >
                      Review Now
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Analytics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center">
            <BarChart4 className="mr-2 h-5 w-5 text-blue-500" />
            Request Analytics
          </CardTitle>
          <CardDescription>Insights about request patterns and fulfillment times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border rounded-md">
              <h4 className="text-sm font-medium text-gray-500">Average Response Time</h4>
              <p className="text-2xl font-bold">{averageResponseTime}</p>
              <p className="text-xs text-green-600">↓ 12% from last month</p>
            </div>
            <div className="p-3 border rounded-md">
              <h4 className="text-sm font-medium text-gray-500">Fulfillment Rate</h4>
              <p className="text-2xl font-bold">87%</p>
              <p className="text-xs text-green-600">↑ 5% from last month</p>
            </div>
            <div className="p-3 border rounded-md">
              <h4 className="text-sm font-medium text-gray-500">Average Delivery Time</h4>
              <p className="text-2xl font-bold">2.5 days</p>
              <p className="text-xs text-green-600">↓ 8% from last month</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" size="sm">
            View Detailed Analytics
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RequestsTab;