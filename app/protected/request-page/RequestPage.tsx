"use client"

import React, { useState, useTransition } from 'react';
import { 
  TrendingUp, ArrowLeft, Loader2, BarChart4,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SharedResourcesTable } from '@/components/component/request-recources-table';
import { fetchSeasonalPredictions, transformPredictionsToChartData } from '@/lib/utils';
import { RESOURCE_CATEGORIES_MAP } from '@/types/Categories';

interface MonthData {
  month: string;
  [key: string]: number | string;
}

const RequestResourcesPage = ({resourceData, transitData, charityData, charity} : {resourceData: ResourcesData[]; transitData: TransitData[]; charityData: CharityData[]; charity: CharityData}) => {
  // State variables would be defined in the first part
  const [selectedResource, setSelectedResource] = useState<ResourcesData | null>(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [requestReason, setRequestReason] = useState('');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  const [seasonalTrendsData, setSeasonalTrendsData] = useState<any[]>([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const otherCharityResourceData = resourceData.filter(resource => resource.charity_id !== charity.id);

  // Function to load predictions
  const loadPredictions = async (forceRefresh = false) => {
    setIsLoadingPredictions(true);
    setPredictionError(null);
    
    try {      
      const predictions = await fetchSeasonalPredictions(charity || null, resourceData, transitData);
      
      if (predictions) {
        const chartData = transformPredictionsToChartData(predictions);
        setSeasonalTrendsData(chartData);
        setPredictionExplanation(predictions.explanation || null);
      } else {
        // Fallback to default data if predictions fail
        setSeasonalTrendsData(defaultSeasonalTrendsData);
        setPredictionError("Could not fetch AI predictions, using sample data instead");
      }
    } catch (error) {
      console.error("Error loading predictions:", error);
      setSeasonalTrendsData(defaultSeasonalTrendsData);
      setPredictionError("Error loading predictions, using sample data instead");
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  // Handle manual refresh button click
  const handleRefreshPredictions = () => {
    loadPredictions(true);
  };

  // Default fallback data
  const [predictionExplanation, setPredictionExplanation] = useState<string | null>(null);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const defaultSeasonalTrendsData = months.map(month => {
    const monthData: MonthData = { month };
    RESOURCE_CATEGORIES_MAP.forEach(category => {
      monthData[category.value] = 0;
    });
    return monthData;
  });

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

        <div className="flex justify-between items-center">
          <div className="flex">
            <Button asChild className="my-auto mr-4" variant="outline" onClick={(e) => handleNavigation(e, "/protected/resource-page")}>
              <span>
                {loading && clickedItem === "/protected/resource-page" ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : (<ArrowLeft className="mr-2 h-4 w-4" />) }
                <Link href="/protected/resource-page">Back</Link>
              </span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Request Resources</h1>
              <p className="text-muted-foreground">Request resources from other charities. Scroll down to view AI predictions</p>
            </div>
          </div>
          
          <Button 
            onClick={handleRefreshPredictions}
            disabled={isLoadingPredictions}
            variant="outline"
            size="icon"
            className="h-10 w-10"
            title="Refresh AI Predictions"
          >
            <RefreshCw className={`h-5 w-5 ${isLoadingPredictions ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="space-y-5 overflow-hidden">
          <SharedResourcesTable resourceData={otherCharityResourceData} charityData={charityData} />

          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Resource Predictions</h1>
            <p className="text-muted-foreground">
              View AI predictions for resources needed in your charity based on your charity profile.
              {predictionError && <span className="text-amber-600 ml-2">{predictionError}</span>}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart4 className="h-5 w-5 text-green-500" />
                Seasonal Resource Trends
                {isLoadingPredictions && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              </CardTitle>
              <CardDescription>
                AI-predicted demand patterns by category based on your charity's profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={seasonalTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    {seasonalTrendsData[0]?.food !==0 && <Line type="monotone" dataKey="food" name={RESOURCE_CATEGORIES_MAP[0].label} stroke="#0088FE" activeDot={{ r: 8 }} />}
                    {seasonalTrendsData[0]?.clothing !==0 && <Line type="monotone" dataKey="clothing" name={RESOURCE_CATEGORIES_MAP[1].label} stroke="#00C49F" />}
                    {seasonalTrendsData[0]?.medical !==0 && <Line type="monotone" dataKey="medical" name={RESOURCE_CATEGORIES_MAP[2].label} stroke="#FF8042" />}
                    {seasonalTrendsData[0]?.housing !==0 && <Line type="monotone" dataKey="housing" name={RESOURCE_CATEGORIES_MAP[3].label} stroke="#FFBB28" />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {predictionExplanation && (
                <div className="mt-4 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-blue-800" />
                    AI Prediction Explanation
                  </h3>
                  <p className="text-sm text-blue-800">
                    {predictionExplanation}
                  </p>
                </div>
              )}
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
    </div>
  );
};

export default RequestResourcesPage;