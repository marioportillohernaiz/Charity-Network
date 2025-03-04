"use client"

import React from 'react';
import { Clock, AlertTriangle, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AllResourcesTable } from '@/components/component/all-resources-table';
import { ResourcesRequestedTable } from '@/components/component/resources-requested-table';

const RequestsTab = ({charity, charityData, resourceData, transitData}:{charity: CharityData; charityData: CharityData[];resourceData: ResourcesData[]; transitData: TransitData[];}) => {

  const requestedResources = transitData.filter(item => item.status == "Requested");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight pt-5">Shareable Resources</h1>
        <p className="text-muted-foreground pb-3">Resources available for you to share.</p>
        <AllResourcesTable resourceData={resourceData} isShareable={true} />
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight pt-5">Resources Requested</h1>
        <p className="text-muted-foreground">Resources requested from other charities to your charity.</p>
        <div className="grid gap-4 md:grid-cols-3 py-3">
          <StatusCard title="Total Requests" size={requestedResources.length} />        
          <StatusCard title="Requested" size={requestedResources.filter(r => r.status === 'Requested').length} />        
          <StatusCard title="In transit" size={requestedResources.filter(r => r.status === 'In transit').length} /> 
        </div>
      </div>

      <ResourcesRequestedTable resourceData={resourceData} transitData={transitData} charityData={charityData} />

      {/* Resource Matching Card */}
      {/* <Card className="bg-white border-green-200">
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

      {/* High Priority Requests Card 
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
      )}*/}
    </div>
  );
};


const StatusCard = ({title, size} : {title: string; size: number;}) => {
  return (
    <Card className="bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{size}</p>
        </div>
          {title == "Total Requests" && <AlertTriangle className="h-6 w-6 text-blue-500" /> }
          {title == "Requested" && <Clock className="h-6 w-6 text-yellow-500" /> }
          {title == "In transit" && <Truck className="h-6 w-6 text-blue-500" /> }
      </CardContent>
    </Card>
  );
};

export default RequestsTab;