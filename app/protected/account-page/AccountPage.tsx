"use client";

import { submitCharity } from '@/app/actions';
import { SubmitButton } from '@/components/submit-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimeRangeSelector } from '@/components/ui/priv_timerangeselector';
import { Textarea } from '@/components/ui/textarea';
import { KeyRound } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast, Toaster } from "sonner"


export default function AccountPage({ accountData }: { accountData: CharityData }) {

  const [name, setName] = useState(accountData?.name || '');
  const [description, setDescription] = useState(accountData?.description || '');
  const [latitude, setLatitude] = useState(accountData?.latitude.toString() || "0");
  const [longitude, setLongitude] = useState(accountData?.longitude.toString() || "0");
  const address = accountData?.address ? accountData.address.split(",").map(item => item.trim()) : [];
  const [addressNumber, setAddressNumber] = useState(address[0] || "");
  const [addressStreet, setAddressStreet] = useState(address[1] || "");
  const [addressCity, setAddressCity] = useState(address[2] || "");
  const [addressPostcode, setAddressPostcode] = useState(address[3] || "");
  const defaultOpeningHours: OpeningHours = {
    Monday: { isOpen: true, start: "09:00", end: "17:00" },
    Tuesday: { isOpen: true, start: "09:00", end: "17:00" },
    Wednesday: { isOpen: true, start: "09:00", end: "17:00" },
    Thursday: { isOpen: true, start: "09:00", end: "17:00" },
    Friday: { isOpen: true, start: "09:00", end: "17:00" },
    Saturday: { isOpen: false, start: "09:00", end: "17:00" },
    Sunday: { isOpen: false, start: "09:00", end: "17:00" },
  };
  const [openingHours, setOpeningHours] = useState<Record<string, { isOpen: boolean; start: string; end: string }>>(
    accountData?.opening_hours && accountData?.opening_hours.toString() !== `["[]"]`
      ? accountData.opening_hours
      : defaultOpeningHours
  );  
  const [phone, setPhone] = useState(accountData?.phone_number || '');
  const [website, setWebsite] = useState(accountData?.website_link || '');

  const handleOpeningHoursChange = (day: string, isOpen: boolean, start: string, end: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { isOpen, start, end },
    }))
  }

  const handleSubmit = async (formData: FormData) => {
    const fullAddress = [addressNumber, addressStreet, addressCity, addressPostcode].join(", ");
    const newUUID = crypto.randomUUID();

    formData.append("eateryId", newUUID);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("address", fullAddress);
    formData.append("openingHours", JSON.stringify(openingHours));
    formData.append("phone", phone);
    formData.append("website", website);
    formData.append("eateryRequested", "true");

    const response = await submitCharity(formData);
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="flex min-h-screen mx-auto flex-col">
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          {accountData ? <h1 className="text-3xl font-semibold">Update Profile</h1> : <h1 className="text-3xl font-semibold">Create Profile</h1>}
        </div>
        <form>
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-2xl font-bold">Eatery Profile Settings</CardTitle>
                {accountData ? (accountData?.admin_verified ? <Badge>Verified</Badge> : <Badge variant="secondary">Verification Pending</Badge>) : null}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Eatery Name</Label>
                    <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <div className="grid grid-cols-4 grid-rows-2 gap-2">
                      <Input id="address_number" name="address_number" placeholder="Building Number" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} required />
                      <Input className="col-span-3" id="address_street" name="address_street" placeholder="Street Name" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} required />
                      <Input className="col-span-2" id="address_city" name="address_city" placeholder="City" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} required />
                      <Input className="col-span-2" id="address_postcode" name="address_postcode" placeholder="Post Code" value={addressPostcode} onChange={(e) => setAddressPostcode(e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        name="latitude"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        name="longitude"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  {/* <div>
                    <Label htmlFor="cuisineType">Cuisine Type</Label>
                    <Input
                      id="cuisineType"
                      name="cuisineType"
                      value={profile.cuisineType}
                      onChange={handleInputChange}
                      required
                    />
                  </div> */}
                  <div className="grid gap-2">
                    <Label htmlFor="openinghours" className="mb-2">Opening Hours</Label>
                    {Object.entries(openingHours).map(([day, { isOpen, start, end }]) => (
                      <TimeRangeSelector
                        key={day}
                        day={day}
                        isOpen={isOpen}
                        start={start}
                        end={end}
                        onChange={(day, isOpen, start, end) => handleOpeningHoursChange(day, isOpen, start, end)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-2">
            <Link href="/protected/reset-password" className="w-full my-4">
              <Button type="button" className="w-full">
                <KeyRound /> Reset Password
              </Button>
            </Link>
            <SubmitButton type="submit" pendingText="Saving..." className="w-full" formAction={handleSubmit}>
              Save Changes
            </SubmitButton>
            <Toaster richColors />
          </div>
        </form>
      </main>
    </div>
  );
}
