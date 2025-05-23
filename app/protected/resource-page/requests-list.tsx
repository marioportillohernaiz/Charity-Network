// TRANSIT TAB
// This component is used to display the transits from and to a charity.
// Components are reusable to avoid code duplication.

"use client"

import React from 'react';
import { Clock, AlertTriangle, Truck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ResourcesRequestedTable } from '@/components/component/resources-requested-table';
import { TransitStatus } from '@/types/TransitStatus';

const RequestsTab = ({charity, charityData, resourceData, transitData}:{charity: CharityData; charityData: CharityData[];resourceData: ResourcesData[]; transitData: TransitData[];}) => {

  const requestedResources = transitData.filter(item => (item.status == TransitStatus.IN_TRANSIT || item.status == TransitStatus.REQUESTED) && item.charity_from == charity.id);
  const yourRequests = transitData.filter(item => (item.status == TransitStatus.IN_TRANSIT || item.status == TransitStatus.REQUESTED) && item.charity_to == charity.id);
  const yourTransitRequests = transitData.filter(item => (item.status == TransitStatus.IN_TRANSIT || item.status == TransitStatus.REQUESTED) && item.charity_to == charity.id);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight pt-5">Resources Requested</h1>
        <p className="text-muted-foreground">Resources requested by other charities to your charity.</p>
        <div className="grid gap-4 md:grid-cols-3 py-3">
          <StatusCard title="Total Requests" size={requestedResources.length} />        
          <StatusCard title="Requested" size={requestedResources.filter(r => r.status === TransitStatus.REQUESTED).length} />        
          <StatusCard title="In transit" size={requestedResources.filter(r => r.status === TransitStatus.IN_TRANSIT).length} /> 
        </div>
      </div>

      <ResourcesRequestedTable resourceData={resourceData} transitData={requestedResources} charityData={charityData} isReciever={false} />

      <div>
        <h1 className="text-3xl font-bold tracking-tight pt-5">Your Requests</h1>
        <p className="text-muted-foreground">Resources you requested from other charities.</p>
        <div className="grid gap-4 md:grid-cols-3 py-3">
          <StatusCard title="Total Requests" size={yourRequests.length} />        
          <StatusCard title="Requested" size={yourRequests.filter(r => r.status === TransitStatus.REQUESTED).length} />        
          <StatusCard title="In transit" size={yourRequests.filter(r => r.status === TransitStatus.IN_TRANSIT).length} /> 
        </div>
      </div>

      <ResourcesRequestedTable resourceData={resourceData} transitData={yourTransitRequests} charityData={charityData} isReciever={true} />
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