"use client"

import React, { useState, useTransition } from 'react';
import { 
  TrendingUp, ArrowLeft, Loader2, BarChart4,
  RefreshCw,
  Clock,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line,
  ReferenceLine
} from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SharedResourcesTable } from '@/components/component/request-recources-table';
import { fetchSeasonalPredictions, transformPredictionsToChartData } from '@/lib/utils';
import { RESOURCE_CATEGORIES_MAP } from '@/types/Categories';
import { Toaster } from 'sonner';

interface MonthData {
  month: string;
  [key: string]: number | string;
}

const useMobileDetect = () => {
  const isMobile = () => /Mobi|Android/i.test(navigator.userAgent);
  return { isMobile };
};

const RequestResourcesPage = ({resourceData, transitData, charityData, charity, salesData} : {resourceData: ResourcesData[]; transitData: TransitData[]; charityData: CharityData[]; charity: CharityData, salesData: Sales[]}) => {
  const [seasonalTrendsData, setSeasonalTrendsData] = useState<any[]>([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const detectMobile = useMobileDetect();

  const otherCharityResourceData = resourceData.filter(resource => resource.charity_id !== charity.id);

  // Function to load predictions
  const loadPredictions = async (forceRefresh = false) => {
    setIsLoadingPredictions(true);
    setPredictionError(null);
    
    try {      
      const predictions = await fetchSeasonalPredictions(charity || null, resourceData, transitData, salesData);
      
      if (predictions) {
        const chartData = transformPredictionsToChartData(predictions);
        setSeasonalTrendsData(chartData);
        setPredictionExplanation(predictions.explanation || null);
        setRecommendation(predictions.recommendation || null);
        setImpact(predictions.impact || null);
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
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [impact, setImpact] = useState<string | null>(null);
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

  const getCurrentMonth = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    return months[currentMonthIndex];
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="grid gap-6">

        <div className="flex justify-between items-center">
          <div className="flex">
            <Button asChild className="my-auto mr-4" variant="outline" onClick={(e) => handleNavigation(e, "/protected/resource-page")}>
              <span>
                {loading && clickedItem === "/protected/resource-page" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowLeft className="mr-2 h-4 w-4" />
                )}
                <Link href="/protected/resource-page">Back</Link>
              </span>
            </Button>
            <div className={`${detectMobile.isMobile() ? "mt-2" : ""}`}>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Request Resources</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Request resources from other charities. Scroll down to view AI predictions
              </p>
            </div>
          </div>

          <Button
            onClick={handleRefreshPredictions}
            disabled={isLoadingPredictions}
            variant="outline"
            size="icon"
            className={`h-10 w-10 ${detectMobile.isMobile() ? "mt-2 self-end" : ""}`}
            title="Refresh AI Predictions"
          >
            <RefreshCw className={`h-5 w-5 ${isLoadingPredictions ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* AI Prediction section */}
        <div className="space-y-4 md:space-y-5 overflow-hidden">
          <div className="mt-2 md:mt-4 bg-blue-50 p-3 md:p-4 rounded-md border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
              {isLoadingPredictions ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2 text-blue-800" />
              )}
              AI Prediction Explanation
            </h3>
            {recommendation ? (
              <div>
                <div className="grid gap-3 md:gap-4 md:grid-cols-2">
                  <Card className="bg-blue-100 border-blue-200">
                    <CardHeader className="pb-1 md:pb-2">
                      <CardTitle className="text-xs md:text-sm font-semibold text-blue-900 flex items-center gap-1 md:gap-2">
                        <Clock className="h-3 w-3 md:h-4 md:w-4" />
                        Temporal Urgency
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs md:text-sm text-blue-900">{recommendation}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-100 border-blue-200">
                    <CardHeader className="pb-1 md:pb-2">
                      <CardTitle className="text-xs md:text-sm font-semibold text-blue-900 flex items-center gap-1 md:gap-2">
                        <Users className="h-3 w-3 md:h-4 md:w-4" />
                        Impact Quantification
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs md:text-sm text-blue-900">{impact}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recommendation available</p>
            )}
          </div>

          <SharedResourcesTable
            resourceData={otherCharityResourceData}
            charityData={charityData}
            charity={charity}
            recommendation={recommendation}
          />

          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">AI Resource Predictions</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              View AI predictions for resources needed in your charity based on your charity profile.
              {predictionError && <span className="text-amber-600 ml-2">{predictionError}</span>}
            </p>
          </div>

          <Card>
            <CardHeader className="pb-2 md:pb-6">
              <CardTitle className="text-base md:text-lg flex items-center gap-1 md:gap-2">
                <BarChart4 className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                Seasonal Resource Trends
                {isLoadingPredictions && <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin ml-2" />}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                AI-predicted demand patterns by category based on your charity's profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 md:h-64 -mx-4 md:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={seasonalTrendsData}
                    margin={{ top: 5, right: detectMobile.isMobile() ? 10 : 30, left: detectMobile.isMobile() ? -15 : 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: detectMobile.isMobile() ? 10 : 12 }} interval={detectMobile.isMobile() ? 1 : 0} />
                    <YAxis tick={{ fontSize: detectMobile.isMobile() ? 10 : 12 }} />
                    <RechartsTooltip />
                    <Legend wrapperStyle={{ fontSize: detectMobile.isMobile() ? 10 : 12 }} />
                    <ReferenceLine
                      x={getCurrentMonth()}
                      stroke="#8884d8"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                      label={{
                        value: detectMobile.isMobile() ? "Now" : "Current Month",
                        position: "insideTopRight",
                        fill: "#8884d8",
                        fontSize: detectMobile.isMobile() ? 10 : 12,
                      }}
                    />
                    {seasonalTrendsData[0]?.food !== 0 && (
                      <Line
                        type="monotone"
                        dataKey="food"
                        name={RESOURCE_CATEGORIES_MAP[0].label}
                        stroke="#0088FE"
                        activeDot={{ r: detectMobile.isMobile() ? 6 : 8 }}
                        strokeWidth={detectMobile.isMobile() ? 1.5 : 2}
                      />
                    )}
                    {seasonalTrendsData[0]?.clothing !== 0 && (
                      <Line
                        type="monotone"
                        dataKey="clothing"
                        name={RESOURCE_CATEGORIES_MAP[1].label}
                        stroke="#00C49F"
                        strokeWidth={detectMobile.isMobile() ? 1.5 : 2}
                      />
                    )}
                    {seasonalTrendsData[0]?.medical !== 0 && (
                      <Line
                        type="monotone"
                        dataKey="medical"
                        name={RESOURCE_CATEGORIES_MAP[2].label}
                        stroke="#FF8042"
                        strokeWidth={detectMobile.isMobile() ? 1.5 : 2}
                      />
                    )}
                    {seasonalTrendsData[0]?.housing !== 0 && (
                      <Line
                        type="monotone"
                        dataKey="housing"
                        name={RESOURCE_CATEGORIES_MAP[3].label}
                        stroke="#FFBB28"
                        strokeWidth={detectMobile.isMobile() ? 1.5 : 2}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {predictionExplanation && (
                <div className="mt-3 md:mt-4 bg-blue-50 p-3 md:p-4 rounded-md border border-blue-100">
                  <h3 className="text-xs md:text-sm font-semibold text-blue-900 mb-1 md:mb-2 flex items-center">
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-blue-800" />
                    AI Prediction Explanation
                  </h3>
                  <p className="text-xs md:text-sm text-blue-800">{predictionExplanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster richColors expand={true} />
    </div>
  );
};

export default RequestResourcesPage;