"use client"

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { AddResources } from '@/components/component/add-resources-dialog';
import { AllResourcesTable } from '@/components/component/all-resources-table';
import { ScrollArea } from '@/components/ui/scrollarea';

const ResourcesTab = ({resourceData}:{resourceData: ResourcesData[]}) => {

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>Resources that need replenishing (less than 20)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {resourceData.filter(r => (r.quantity - r.shareable_quantity) < 20).length > 0 ? (
                resourceData.filter(r => (r.quantity - r.shareable_quantity) < 20).length > 4 ? (
                  <><ScrollArea className="max-h-52 overflow-auto mb-4">
                    {resourceData.filter(r => (r.quantity - r.shareable_quantity) < 20).map(resource => (
                      <div key={resource.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50 mb-2">
                        <div>
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-sm text-gray-500">{resource.quantity - resource.shareable_quantity} {resource.unit} available</div>
                        </div>
                        <AddResources resource={resource} action={"restock"} />
                      </div>
                    ))}
                  </ScrollArea>
                  <p className="text-center text-sm text-gray-500">Scroll down to view more</p></>
                ) : (
                  resourceData.filter(r => (r.quantity - r.shareable_quantity) < 20).map(resource => (
                    <div key={resource.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                      <div>
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-sm text-gray-500">{resource.quantity} {resource.unit} left</div>
                      </div>
                      <AddResources resource={resource} action={"restock"} />
                    </div>
                  ))
                )
              ) : (
                <p>No items need replenishing</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expiring Soon</CardTitle>
            <CardDescription>Resources that will expire within 90 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(() => {
                const expiringItems = resourceData.filter(r => {
                  if (!r.expiry_date) return false;
                  const expiryDate = new Date(r.expiry_date);
                  const today = new Date();
                  const diffTime = expiryDate.getTime() - today.getTime();
                  return diffTime < 90 * 24 * 60 * 60 * 1000 && diffTime > 0;
                });
                
                if (expiringItems.length === 0) {
                  return <p>No items expiring soon</p>;
                }
                
                return expiringItems.map(resource => {
                  const expiryDate = new Date(resource.expiry_date!);
                  const today = new Date();
                  const diffTime = expiryDate.getTime() - today.getTime();
                  const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={resource.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                      <div>
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-sm text-gray-500">Expires: {resource.expiry_date ? format(resource.expiry_date.toString(), "dd/MM/yyyy") : ""}</div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {daysUntilExpiry} days
                      </Badge>
                    </div>
                  );
                });
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h1 className="text-2xl font-bold">All Resources</h1>
        <p className="text-gray-500">Complete list of resources in your inventory.</p>
      </div>
      <AllResourcesTable resourceData={resourceData} />
    </div>
  );
};

export default ResourcesTab;