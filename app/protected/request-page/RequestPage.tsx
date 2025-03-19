"use client"

import React, { useState, useTransition } from 'react';
import { 
  MapPin, TrendingUp, ArrowRight, Info, ArrowLeft, Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ResourcesRequestedTable } from '@/components/component/resources-requested-table';
import { SharedResourcesTable } from '@/components/component/request-recources-table';
  
type PredictedNeed = {
  category: string;
  currentStock: number;
  predictedNeed: number;
  timeframe: string;
  priority: string;
  trend: string;
  unit: string;
};

const RequestResourcesPage = ({resourceData, transitData, charityData} : {resourceData: ResourcesData[]; transitData: TransitData[]; charityData: CharityData[]}) => {
  // State variables would be defined in the first part
  const [selectedResource, setSelectedResource] = useState<ResourcesData | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [requestReason, setRequestReason] = useState('');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isShowPredictionDetails, setIsShowPredictionDetails] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictedNeed | null>();

  // Mock data for predicted needs - would be defined in the first part
  const predictedNeeds = [
    {
      category: 'Food',
      currentStock: 120,
      predictedNeed: 300,
      timeframe: '30 days',
      priority: 'High',
      trend: 'Increasing',
      unit: 'items'
    },
    {
      category: 'Medical & Health Supplies',
      currentStock: 45,
      predictedNeed: 75,
      timeframe: '30 days',
      priority: 'Medium',
      trend: 'Stable',
      unit: 'kits'
    },
    {
      category: 'Clothing & Personal Items',
      currentStock: 200,
      predictedNeed: 250,
      timeframe: '60 days',
      priority: 'Medium',
      trend: 'Decreasing',
      unit: 'items'
    },
    {
      category: 'Educational Materials',
      currentStock: 50,
      predictedNeed: 150,
      timeframe: '90 days',
      priority: 'Low',
      trend: 'Increasing',
      unit: 'bundles'
    }
  ];
  
  // Prediction details chart data - would be defined in the first part
  const predictionDetailsData = [
    { month: 'Mar', actual: 120, predicted: 300 },
    { month: 'Apr', actual: null, predicted: 350 },
    { month: 'May', actual: null, predicted: 320 },
    { month: 'Jun', actual: null, predicted: 290 }
  ];

  // Location density data for the map
  const locationData = [
    { location: 'Boston', count: 42, lat: 42.3601, lng: -71.0589 },
    { location: 'Cambridge', count: 28, lat: 42.3736, lng: -71.1097 },
    { location: 'Somerville', count: 24, lat: 42.3876, lng: -71.0995 },
    { location: 'Medford', count: 18, lat: 42.4184, lng: -71.1061 },
    { location: 'Quincy', count: 15, lat: 42.2529, lng: -71.0023 },
    { location: 'Newton', count: 22, lat: 42.3370, lng: -71.2092 },
    { location: 'Brookline', count: 19, lat: 42.3318, lng: -71.1212 },
    { location: 'Watertown', count: 14, lat: 42.3709, lng: -71.1828 }
  ];
  
  // Mock data for resource availability by time
  const availabilityByTimeData = [
    { time: '1-7 days', percentage: 65 },
    { time: '8-14 days', percentage: 82 },
    { time: '15-30 days', percentage: 91 },
    { time: '31+ days', percentage: 97 }
  ];
  
  // Utility functions
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'High':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'Low':
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };
  
  const getTrendIndicator = (trend: string) => {
    switch(trend) {
      case 'Increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'Stable':
        return <ArrowRight className="h-4 w-4 text-yellow-500" />;
      case 'Decreasing':
        return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default:
        return null;
    }
  };
  
  // Function to calculate the deficit percentage
  const calculateDeficit = (current: number, predicted: number) => {
    if (current >= predicted) return 0;
    return Math.round(((predicted - current) / predicted) * 100);
  };

  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [clickedItem, setClickedItem] = useState<string | null>(null);

  const handleNavigation = (event: React.MouseEvent, path: string) => {
    event.preventDefault();
    setClickedItem(path);

    startTransition(() => {
      router.push(path);
    });
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="grid gap-6">

        <div className="flex">
          <Button asChild className="my-auto mr-4" variant="outline" onClick={(e) => handleNavigation(e, "/protected/resource-page")}>
            <span>
              {loading && clickedItem === "/protected/resource-page" ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : (<ArrowLeft className="mr-2 h-4 w-4" />) }
              <Link href="/protected/resource-page">Back</Link>
            </span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Request Resources</h1>
            <p className="text-muted-foreground">Request resources from other charities.</p>
          </div>
        </div>

        <div className="space-y-5 overflow-hidden">
          <SharedResourcesTable resourceData={resourceData} charityData={charityData} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                AI Resource Predictions
              </CardTitle>
              <CardDescription>Resources you'll need based on historical data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictedNeeds.map((prediction, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    prediction.priority === 'High' 
                      ? 'border-l-red-500' 
                      : prediction.priority === 'Medium' 
                        ? 'border-l-yellow-500' 
                        : 'border-l-blue-500'
                  }`}
                  onClick={() => {
                    setSelectedPrediction(prediction);
                    setIsShowPredictionDetails(true);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{prediction.category}</h3>
                    <div className="flex items-center gap-1">
                      {getPriorityBadge(prediction.priority)}
                      {getTrendIndicator(prediction.trend)}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Current: {prediction.currentStock} {prediction.unit}</span>
                      <span>Needed: {prediction.predictedNeed} {prediction.unit}</span>
                    </div>
                    <Progress 
                      value={(prediction.currentStock / prediction.predictedNeed) * 100} 
                      className="h-2" 
                    />
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">Within {prediction.timeframe}</span>
                      {prediction.currentStock < prediction.predictedNeed && (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          {calculateDeficit(prediction.currentStock, prediction.predictedNeed)}% deficit
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end">
                <Button variant="link" className="text-sm">View all predictions</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Resource Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Resource</DialogTitle>
            <DialogDescription>
              Submit a request for this resource to the charity.
            </DialogDescription>
          </DialogHeader>
          
          {selectedResource && (
            <div className="py-4">
              <div className="flex items-start gap-4 mb-4">
                <Avatar>
                  <AvatarImage />
                  <AvatarFallback>CharityName</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">CharityName</h3>
                  <div className="text-sm text-gray-500">CharityLocation</div>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">{selectedResource.name}</h4>
                  <Badge variant="outline">{selectedResource.category}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Available</label>
                    <div>{selectedResource.quantity} {selectedResource.unit}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Condition</label>
                    <div>Not specified</div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Request Quantity</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setRequestQuantity(Math.max(1, requestQuantity - 1))}
                      disabled={requestQuantity <= 1}
                    >
                      -
                    </Button>
                    <Input 
                      type="number" 
                      value={requestQuantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value > 0 && value <= selectedResource.quantity) {
                          setRequestQuantity(value);
                        }
                      }}
                      min="1"
                      max={selectedResource.quantity}
                      className="text-center"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setRequestQuantity(Math.min(selectedResource.quantity, requestQuantity + 1))}
                      disabled={requestQuantity >= selectedResource.quantity}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Reason for Request</label>
                  <Textarea 
                    placeholder="Briefly explain how you'll use these resources..."
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm this request is for charitable purposes
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Your organization will be responsible for arranging pickup or delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Prediction Details Dialog */}
      <Dialog open={isShowPredictionDetails} onOpenChange={setIsShowPredictionDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Resource Prediction Details</DialogTitle>
            <DialogDescription>
              Detailed analysis of predicted resource needs
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrediction && (
            <div className="py-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{selectedPrediction.category}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getPriorityBadge(selectedPrediction.priority)}
                    <span className="text-sm text-gray-500">
                      {selectedPrediction.trend === 'Increasing' ? 'Increasing demand' : 
                       selectedPrediction.trend === 'Decreasing' ? 'Decreasing demand' : 
                       'Stable demand'}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500">Current Stock</div>
                  <div className="text-xl font-bold">{selectedPrediction.currentStock} {selectedPrediction.unit}</div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Current Stock</span>
                  <span>Predicted Need: {selectedPrediction.predictedNeed} {selectedPrediction.unit}</span>
                </div>
                <Progress 
                  value={(selectedPrediction.currentStock / selectedPrediction.predictedNeed) * 100} 
                  className="h-3" 
                />
                
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-500">Needed within {selectedPrediction.timeframe}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {selectedPrediction.predictedNeed - selectedPrediction.currentStock} {selectedPrediction.unit} needed
                  </Badge>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Monthly Projection</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={predictionDetailsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="actual" 
                        name="Current Stock" 
                        fill="#82ca9d" 
                        stroke="#82ca9d" 
                        fillOpacity={0.3} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="predicted" 
                        name="Predicted Need" 
                        fill="#8884d8" 
                        stroke="#8884d8" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Recommendation</h4>
                <div className="p-3 bg-blue-50 text-blue-800 rounded-md">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      Based on your historical usage patterns and seasonal trends, we recommend 
                      requesting <span className="font-semibold">{selectedPrediction.predictedNeed - selectedPrediction.currentStock} {selectedPrediction.unit}</span> of {selectedPrediction.category.toLowerCase()} within the next {selectedPrediction.timeframe.split(' ')[0]} days.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsShowPredictionDetails(false)}>
              Close
            </Button>
            <Button>
              Search Available Resources
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestResourcesPage;