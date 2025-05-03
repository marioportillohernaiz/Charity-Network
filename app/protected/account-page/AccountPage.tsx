// ACCOUNT PAGE
// Allows the charity to edit their profile, location, categories, and settings.

"use client";

import { submitCharity } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimeRangeSelector } from '@/components/component/time-range-selector';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Clock, Compass, Globe, ImagePlus, Info, KeyRound, Loader2, MapPin, Phone, Save, Settings, User } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { toast, Toaster } from "sonner";
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import L from "leaflet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PRIMARY_CATEGORIES, SECONDARY_CATEGORIES } from '@/types/Categories';

export default function AccountPage({ accountData }: { accountData: CharityData }) {
  
  // Profile state
  const [name, setName] = useState(accountData?.name || '');
  const [description, setDescription] = useState(accountData?.description || '');
  const [activeTab, setActiveTab] = useState("profile");
  
  // Location state
  const [latitude, setLatitude] = useState(accountData?.latitude?.toString() || "0");
  const [longitude, setLongitude] = useState(accountData?.longitude?.toString() || "0");
  const address = accountData?.address ? accountData.address.split(",").map(item => item.trim()) : [];
  const [addressNumber, setAddressNumber] = useState(address[0] || "");
  const [addressStreet, setAddressStreet] = useState(address[1] || "");
  const [addressCity, setAddressCity] = useState(address[2] || "");
  const [addressPostcode, setAddressPostcode] = useState(address[3] || "");
  
  // Contact state
  const [email, setEmail] = useState(accountData?.email || '');
  const [phone, setPhone] = useState(accountData?.phone_number || '');
  const [website, setWebsite] = useState(accountData?.website_link || '');
  
  // Social media
  const [facebook, setFacebook] = useState(accountData?.facebook_link || '');
  const [twitter, setTwitter] = useState(accountData?.twitter_link || '');
  const [instagram, setInstagram] = useState(accountData?.instagram_link || '');

  const categoryData = accountData?.category_and_tags || { primary: '', secondary: [], tags: [] };
  const [primaryCategory, setPrimaryCategory] = useState<string>(() => categoryData.primary || '');
  const [secondaryCategories, setSecondaryCategories] = useState<string[]>(() => [...(categoryData.secondary || [])]);
  const [tags, setTags] = useState<string[]>(() => [...(categoryData.tags || [])]);
  const [newTag, setNewTag] = useState('');

  // Settings
  const [showPhone, setShowPhone] = useState(accountData?.settings?.show_phone);
  const [showWebsite, setShowWebsite] = useState(accountData?.settings?.show_website);
  const [resourceAlerts, setResourceAlerts] = useState(accountData?.settings?.resource_alert);
  const [resourceRequests, setResourceRequests] = useState(accountData?.settings?.resource_request);
  
  // Opening hours
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
  
  const [saving, setSaving] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
      const map = L.map(mapRef.current).setView([Number(latitude), Number(longitude)], 18);
      mapInstanceRef.current = map;
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      const customIcon = L.icon({iconUrl: "/pin.png",iconSize: [25, 35],iconAnchor: [16, 40],});

      L.marker([Number(latitude), Number(longitude)], { icon: customIcon }).addTo(map);

      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    }
  }, [latitude, longitude]);
  
  useEffect(() => {}, [
    name, description, addressNumber, addressStreet, 
    addressCity, addressPostcode, phone, website, 
    openingHours
  ]);

  const handleOpeningHoursChange = (day: string, isOpen: boolean, start: string, end: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { isOpen, start, end },
    }));
  }

  const handleSecondaryCategoryToggle = (category: string, checked: boolean) => {
    if (checked) {
      setSecondaryCategories(prev => [...prev, category]);
    } else {
      setSecondaryCategories(prev => prev.filter(c => c !== category));
    }
  };

  const handleTagAdd = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleTagRemove = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    
    try {
      const fullAddress = [addressNumber, addressStreet, addressCity, addressPostcode].join(", ");
      const categoriesAndTags = JSON.stringify({
        primary: primaryCategory,
        secondary: secondaryCategories,
        tags: tags
      });
      const settingsJSON = JSON.stringify({
        show_phone: showPhone,
        show_website: showWebsite,
        resource_alert: resourceAlerts,
        resource_request: resourceRequests
      });

      if (name !== "" && addressNumber !== "" && addressStreet !== "" && addressCity !== "" && addressPostcode !== "" && latitude !== "0" && longitude !== "0") {
        const formData = new FormData;

        formData.append("name", name);
        formData.append("description", description);
        formData.append("latitude", latitude);
        formData.append("longitude", longitude);
        formData.append("address", fullAddress);
        formData.append("openingHours", JSON.stringify(openingHours));
        formData.append("phone", phone);
        formData.append("email", email);
        formData.append("website", website);
  
        formData.append("facebook", facebook);
        formData.append("twitter", twitter);
        formData.append("instagram", instagram);
  
        formData.append("category", categoriesAndTags);
        formData.append("settings", settingsJSON);
  
        const response = await submitCharity(formData);
        if (response.success) {
          toast.success(response.message);
        } else {
          toast.error(response.message);
        }
      } else {
        toast.error("Please fill in fields with *");
      }
    } catch (error) {
      toast.error("An error occurred while saving changes");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    let completed = 0;
    
    if (name) completed++;
    if (description) completed++;
    
    if (addressNumber) completed++;
    if (addressStreet) completed++;
    if (addressCity) completed++;
    if (addressPostcode) completed++;
    
    if (email) completed++;
    if (phone) completed++;
    if (website) completed++;
    
    return Math.round((completed / 9) * 100);
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 space-y-6 p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your charity profile, privacy settings, and preferences
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button type="submit" onClick={handleSubmit}>
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4" /> Saving Changes</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Changes</>
              )}
            </Button>
          </div>
        </div>
        
        {calculateProfileCompletion() < 100 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Complete your profile</AlertTitle>
            <AlertDescription>
              Your profile is {calculateProfileCompletion()}% complete. Complete your profile to help others find and connect with your charity.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-0">
                <div className="w-full">
                  <div className="flex flex-col w-full h-auto space-y-0 rounded-none bg-transparent">
                    <button onClick={() => setActiveTab("profile")} className={`flex items-center justify-start px-6 py-3 text-left font-medium ${activeTab === "profile" ? "bg-accent text-accent-foreground" : ""}`}>
                      <User className="w-4 h-4 mr-2" /> Profile *
                    </button>
                    <button onClick={() => setActiveTab("location")} className={`flex items-center justify-start px-6 py-3 text-left font-medium ${activeTab === "location" ? "bg-accent text-accent-foreground" : ""}`}>
                      <MapPin className="w-4 h-4 mr-2" /> Location *
                    </button>
                    <button onClick={() => setActiveTab("categories")} className={`flex items-center justify-start px-6 py-3 text-left font-medium ${activeTab === "categories" ? "bg-accent text-accent-foreground" : ""}`}>
                      <Compass className="w-4 h-4 mr-2" /> Categories
                    </button>
                    <button onClick={() => setActiveTab("settings")} className={`flex items-center justify-start px-6 py-3 text-left font-medium ${activeTab === "privacy" ? "bg-accent text-accent-foreground" : ""}`}>
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Verification Status */}
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {accountData?.admin_verified ? (
                    <>
                      <CheckCircle className="text-green-500 h-5 w-5 mr-2" />
                      <div>
                        <p className="font-medium">Verified</p>
                        <p className="text-xs text-muted-foreground">Your charity is verified</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="text-amber-500 h-5 w-5 mr-2" />
                      <div>
                        <p className="font-medium">Pending</p>
                        <p className="text-xs text-muted-foreground">Verification in progress</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* CHARITY PROFILE TAB */}
          <div className="md:col-span-4 space-y-6">
            <div className="w-full">
              <div className={activeTab === "profile" ? "space-y-6" : "hidden"}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle>Basic Information</CardTitle>
                    </div>
                    <CardDescription>
                      Update your organization's basic information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div className="flex-1 space-y-4 w-full">
                        <div>
                          <Label htmlFor="name">Charity Name *</Label>
                          <Input 
                            id="name" 
                            name="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea 
                            id="description" 
                            name="description" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            className="min-h-[120px]"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Write a short description of your charity's mission and services
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="header-image">Charity Image</Label>
                      <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center">
                        {accountData?.src_charity_img ? (
                          <div className="relative">
                            <img 
                              src={`/${accountData?.src_charity_img}`} 
                              className="h-[300px] mx-auto rounded-md" 
                            />
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm" 
                              className="absolute top-2 right-2"
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <label htmlFor="header-image-upload" className="cursor-pointer">
                            <Input 
                              id="header-image-upload" 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                            />
                            <div className="py-8">
                              <ImagePlus className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Click to upload an image
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Recommended size: 1200 x 400px
                              </p>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle>Contact Information</CardTitle>
                    </div>
                    <CardDescription>
                      How people can reach your charity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        name="website" 
                        type="url" 
                        value={website} 
                        onChange={(e) => setWebsite(e.target.value)} 
                        placeholder="https://www.example.org" 
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle>Social Media</CardTitle>
                    </div>
                    <CardDescription>
                      Link your social media accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input 
                        id="facebook" 
                        name="facebook" 
                        type="url" 
                        value={facebook} 
                        onChange={(e) => setFacebook(e.target.value)} 
                        placeholder="https://facebook.com/your-charity" 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="twitter">Twitter / X</Label>
                      <Input 
                        id="twitter" 
                        name="twitter" 
                        type="url" 
                        value={twitter} 
                        onChange={(e) => setTwitter(e.target.value)} 
                        placeholder="https://twitter.com/your-charity" 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input 
                        id="instagram" 
                        name="instagram" 
                        type="url" 
                        value={instagram} 
                        onChange={(e) => setInstagram(e.target.value)} 
                        placeholder="https://instagram.com/your-charity" 
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle>Opening Hours</CardTitle>
                    </div>
                    <CardDescription>
                      Set when your charity is open
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
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
                  </CardContent>
                </Card>
              </div>
              
              {/* LOCATION BASED TAB */}
              <div className={activeTab === "location" ? "space-y-6" : "hidden"}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle>Location</CardTitle>
                    </div>
                    <CardDescription>
                      Set your charity's physical location
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <div className="grid grid-cols-4 grid-rows-2 gap-2 mt-2">
                        <Input 
                          id="address_number" 
                          name="address_number" 
                          placeholder="Building Number" 
                          value={addressNumber} 
                          onChange={(e) => setAddressNumber(e.target.value)} 
                          required 
                        />
                        <Input 
                          className="col-span-3" 
                          id="address_street" 
                          name="address_street" 
                          placeholder="Street Name" 
                          value={addressStreet} 
                          onChange={(e) => setAddressStreet(e.target.value)} 
                          required 
                        />
                        <Input 
                          className="col-span-2" 
                          id="address_city" 
                          name="address_city" 
                          placeholder="City" 
                          value={addressCity} 
                          onChange={(e) => setAddressCity(e.target.value)} 
                          required 
                        />
                        <Input 
                          className="col-span-2" 
                          id="address_postcode" 
                          name="address_postcode" 
                          placeholder="Post Code" 
                          value={addressPostcode} 
                          onChange={(e) => setAddressPostcode(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="latitude">Latitude *</Label>
                        <Input 
                          id="latitude" 
                          name="latitude" 
                          type="text" 
                          value={latitude} 
                          onChange={(e) => setLatitude(e.target.value)} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="longitude">Longitude *</Label>
                        <Input 
                          id="longitude" 
                          name="longitude" 
                          type="text" 
                          value={longitude} 
                          onChange={(e) => setLongitude(e.target.value)} 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Your address will be shown on the map and used to help people find your charity.
                      </p>
                      
                      <div className="mt-4 border rounded-md h-[300px] w-full relative">
                        <div id="smallmap"><div ref={mapRef} className="h-full w-full"></div></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* CATEGORIES TAB */}
              <div className={activeTab === "categories" ? "space-y-6" : "hidden"}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <Compass className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle>Categories & Tags</CardTitle>
                    </div>
                    <CardDescription>
                      Categorize your charity to help people find you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="primary-category">Primary Category</Label>
                      <Select 
                        value={primaryCategory}
                        onValueChange={(value) => setPrimaryCategory(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIMARY_CATEGORIES.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="subcategories">Secondary Categories</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {SECONDARY_CATEGORIES.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <input 
                              type="checkbox"
                              id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                              checked={secondaryCategories.includes(category)}
                              onChange={(e) => handleSecondaryCategoryToggle(category, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label
                              htmlFor={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="px-3 py-1">
                            {tag}
                            <button 
                              className="ml-2 text-muted-foreground hover:text-foreground" 
                              onClick={() => handleTagRemove(tag)}
                              type="button"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                        <div className="flex">
                          <Input 
                            id="new-tag" 
                            placeholder="Add a tag..." 
                            className="w-32 h-8"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={handleKeyDown}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-8"
                            onClick={handleTagAdd}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Tags help people discover your charity when searching for specific needs or services
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* SETTINGS TAB */}
              <div className={activeTab === "settings" ? "space-y-6" : "hidden"}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <Info className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle>Notification Preferences</CardTitle>
                    </div>
                    <CardDescription>
                      Choose how you want to be notified
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Resource Alerts</h3>
                          <p className="text-sm text-muted-foreground">
                            Get notified when new resources are available
                          </p>
                        </div>
                        <Switch checked={resourceAlerts} onCheckedChange={setResourceAlerts} 
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Resource Requests</h3>
                          <p className="text-sm text-muted-foreground">
                            Get notified of resource requests from other charities
                          </p>
                        </div>
                        <Switch checked={resourceRequests} onCheckedChange={setResourceRequests}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle>Privacy Settings</CardTitle>
                    </div>
                    <CardDescription>
                      Control what information is visible to others
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Show Phone Number</h3>
                          <p className="text-sm text-muted-foreground">
                            Display your phone number on your public profile
                          </p>
                        </div>
                        <Switch 
                          checked={showPhone} 
                          onCheckedChange={() => setShowPhone(!showPhone)}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Show Website</h3>
                          <p className="text-sm text-muted-foreground">
                            Display your website link on your public profile
                          </p>
                        </div>
                        <Switch 
                          checked={showWebsite} 
                          onCheckedChange={() => setShowWebsite(!showWebsite)}
                        />
                      </div>

                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Show Social Links</h3>
                          <p className="text-sm text-muted-foreground">
                            Display your social links on your public profile
                          </p>
                        </div>
                        <Switch 
                          checked={showWebsite} 
                          onCheckedChange={() => setShowWebsite(!showWebsite)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      <KeyRound className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle>Security Settings</CardTitle>
                    </div>
                    <CardDescription>
                      Manage your password and account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Password</h3>
                      <p className="text-sm text-muted-foreground mb-4">It's a good idea to use a strong password that you don't use elsewhere</p>
                      <Link href="/protected/reset-password">

                        <Button variant="outline">
                          <KeyRound className="h-4 w-4 mr-2" /> Change Password
                        </Button>
                      </Link>
                    </div>
                  
                    <Separator className="my-4" />
                  
                    <div>
                      <h3 className="font-medium mb-2">Account Deletion</h3>
                      <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all your data</p>
                      <Button variant="destructive" disabled={true}>Delete Account</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Toaster richColors />
    </div>
  );
}