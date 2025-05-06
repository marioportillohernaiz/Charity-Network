// RESOURCE LIST PAGE
// Displays the list of resources in the charity's inventory.

"use client"

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { AddResources } from '@/components/component/add-resources-dialog';
import { AllResourcesTable } from '@/components/component/all-resources-table';
import { ScrollArea } from '@/components/ui/scrollarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertCircle, Check } from 'lucide-react';
import { updateScarceResource } from '@/app/actions';

const ResourcesTab = ({resourceData}:{resourceData: ResourcesData[]}) => {
  const [selectedResources, setSelectedResources] = useState<string[]>(
    resourceData
      .filter(resource => resource.is_scarce === true)
      .map(resource => resource.id)
  );

  const handleToggleResource = (resourceId: string) => {
    if (selectedResources.includes(resourceId)) {
      setSelectedResources(selectedResources.filter((id) => id !== resourceId))
    } else {
      if (selectedResources.length >= 5) {
        toast.error("You can only select up to 5 scarce resources");
        return
      }
      setSelectedResources([...selectedResources, resourceId])
    }
  };

  const handleSave = async () => {
    if (selectedResources.length === 0) {
      toast.error("Add at least one scarce resource");
    } else {
      const newResource = await updateScarceResource(selectedResources);
      if (newResource.success) {
        toast.success(newResource.message);
      } else {
        toast.error(newResource.message);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mt-4">
        <Card className="bg-secondary">
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
                      <div key={resource.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50 bg-white mb-2">
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
                    <div key={resource.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50 bg-white">
                      <div>
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-sm text-gray-500">{resource.quantity} {resource.unit} left</div>
                      </div>
                      <AddResources resource={resource} action={"restock"} />
                    </div>
                  ))
                )
              ) : (
                <p className="text-center py-8 text-gray-500">No items need replenishing</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-secondary">
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
                  return <p className="text-center py-8 text-gray-500">No items expiring soon</p>;
                }
                
                return expiringItems.map(resource => {
                  const expiryDate = new Date(resource.expiry_date!);
                  const today = new Date();
                  const diffTime = expiryDate.getTime() - today.getTime();
                  const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={resource.id} className="flex justify-between items-center p-2 border rounded bg-white hover:bg-gray-50">
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

      <Card className="bg-secondary">
        <CardHeader>
          <CardTitle>Select Scarce Resources</CardTitle>
          <CardDescription>
            Identify up to 5 resources that are scarce in your charity. These will be highlighted to other organizations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {selectedResources.length}/5 selected
              </Badge>
              <Button size="sm" onClick={handleSave} disabled={selectedResources.length === 0}>
                Save Changes
              </Button>
            </div>

            <div className="grid gap-2 max-h-[150px] overflow-y-auto pr-2">
              {resourceData.map((resource) => (
                <div
                  key={resource.id}
                  className={`flex items-center justify-between p-3 rounded-md border cursor-pointer bg-white transition-colors ${
                    selectedResources.includes(resource.id) ? "bg-primary/10 border-primary" : "hover:bg-secondary"
                  }`}
                  onClick={() => handleToggleResource(resource.id)}
                >
                  <div className="flex items-center gap-2">
                    {selectedResources.includes(resource.id) && <Check className="h-4 w-4 text-primary" />}
                    <span className="font-medium">{resource.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({resource.quantity} {resource.unit})
                    </span>
                  </div>
                  {selectedResources.includes(resource.id) && (
                    <Badge className="bg-primary text-primary-foreground">Scarce</Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mr-2" />
              <p>Scarce resources will be highlighted to other organizations for potential donations.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h1 className="text-2xl font-bold">All Resources</h1>
        <p className="text-gray-500">Complete list of resources in your inventory.</p>
      </div>
      <AllResourcesTable resourceData={resourceData} />
    </div>
  );
};

export default ResourcesTab;