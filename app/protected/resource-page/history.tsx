"use client"

import React, { useState } from 'react';
import { Search, Download, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const HistoryTab = ({charityData,resourceData,resourceTransitFrom,resourceTransitTo}:{charityData: CharityData[];resourceData: ResourcesData[]; resourceTransitFrom:TransitData[]; resourceTransitTo:TransitData[]}) => {

  // Enhanced sample data with reserved quantities
  const [resources, setResources] = useState(resourceData || [])
  const [transitsFrom, setTransitFromData] = useState(resourceTransitFrom || []);
  const [transitsTo, setTransitToData] = useState(resourceTransitTo || []);

  return (
    <div className="space-y-4">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Sharing History - Resources Sent To Charities</CardTitle>
              <CardDescription>History of resources shared with other charities</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export History
              </Button>
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
              />
            </div>
            <select className="bg-white border rounded-md px-3 py-1 text-sm">
              <option value="all">All Resources</option>
              {resources.map(resource => (
                <option key={resource.id} value={resource.id}>{resource.name}</option>
              ))}
            </select>
            <select className="bg-white border w-48 rounded-md px-3 py-1 text-sm">
              <option value="all">All charities</option>
              {charityData.map(charity => (
                <option key={charity.id} value={charity.name}>{charity.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {transitsTo.map(history => (
              <div key={history.id} className="flex items-start border rounded-md p-4 hover:bg-gray-50">
                <div className="flex-grow">
                  <div className="flex items-center mb-1">
                    <span className="font-medium mr-2">{history.resource_name}</span>
                    <span className="text-sm text-gray-500">
                      {history.quantity} items shared with {history.charity_to}
                    </span>
                  </div>
                  {/* <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{history.date}</span>
                    <span className="mx-2">•</span>
                    {getTransitStatusBadge(history.status)}
                  </div> */}
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {transitsTo.length} sharing records
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

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Sharing History - Resources Received From Charities</CardTitle>
              <CardDescription>History of resources shared to our charity</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export History
              </Button>
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
              />
            </div>
            <select className="bg-white border rounded-md px-3 py-1 text-sm">
              <option value="all">All Resources</option>
              {resources.map(resource => (
                <option key={resource.id} value={resource.id}>{resource.name}</option>
              ))}
            </select>
            <select className="bg-white border rounded-md w-48 px-3 py-1 text-sm">
              <option value="all">All Charities</option>
              <option value="Hope Foundation">Hope Foundation</option>
              <option value="Care Center">Care Center</option>
              <option value="Help Network">Help Network</option>
              <option value="Community Aid">Community Aid</option>
              <option value="Education First">Education First</option>
            </select>
          </div>

          <div className="space-y-4">
            {transitsFrom.map(history => (
              <div key={history.id} className="flex items-start border rounded-md p-4 hover:bg-gray-50">
                <div className="flex-grow">
                  <div className="flex items-center mb-1">
                    <span className="font-medium mr-2">{history.resource_name}</span>
                    <span className="text-sm text-gray-500">
                      {history.quantity} items shared with {history.charity_to}
                    </span>
                  </div>
                  {/* <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{history.date}</span>
                    <span className="mx-2">•</span>
                    {getTransitStatusBadge(history.status)}
                  </div> */}
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {transitsFrom.length} sharing records
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
    </div>
  );
};

export default HistoryTab;