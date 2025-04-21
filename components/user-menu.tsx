"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { BadgeCheck, Bell, Loader2, Menu, X } from "lucide-react";
import Link from "next/link";
import { deleteNotification, signOutAction } from "@/app/actions";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

export default function UserMenu({ registeredCharity, notificationData }: { registeredCharity: CharityData; notificationData: NotificationData[]; }) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (event: React.MouseEvent, path: string) => {
    event.preventDefault();
    setClickedItem(path);
    setIsOpen(false);

    startTransition(() => {
      router.push(path);
    });
  };

  const handleDeleteNotification = async (id: string) => {
    const response = await deleteNotification(id);
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const NavLinks = () => (
    <>
      <Badge variant="secondary" className="mr-2">Hi {registeredCharity?.name}</Badge>

      {registeredCharity?.admin_verified && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span><BadgeCheck className="text-white" /></span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Verified</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {registeredCharity &&
        <><Button asChild size="sm" variant={"link"} className="text-white" onClick={(e) => handleNavigation(e, "/protected")}>
          <span className="flex items-center">
            {loading && clickedItem === "/protected" && <Loader2 className="h-4 w-4 animate-spin text-white mr-2" />}
            <Link href="/protected">Map</Link>
          </span>
        </Button>
        
        <Button asChild size="sm" variant={"link"} className="text-white" onClick={(e) => handleNavigation(e, "/protected/resource-page")}>
          <span className="flex items-center">
            {loading && clickedItem === "/protected/resource-page" && <Loader2 className="h-4 w-4 animate-spin text-white mr-2" />}
            <Link href="/protected/resource-page">Resources</Link>
          </span>
        </Button></>
      }
      
      <Button asChild size="sm" variant={"link"} className="text-white" onClick={(e) => handleNavigation(e, "/protected/account-page")}>
        <span className="flex items-center">
          {loading && clickedItem === "/protected/account-page" && <Loader2 className="h-4 w-4 animate-spin text-white mr-2" />}
          <Link href="/protected/account-page">Account</Link>
        </span>
      </Button>
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex md:items-center md:space-x-2">
        <NavLinks />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="relative">
              <Bell color="#ffffff" className="w-5 h-5" />
              {notificationData?.length > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs">
                  {notificationData.length > 9 ? '9+' : notificationData.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notificationData?.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">No notifications</div>
            ) : (
              notificationData?.slice(0, 5).map((notification) => (
                <DropdownMenuItem key={notification.id} className="cursor-pointer p-0">
                  <div className="flex flex-col w-full p-2 hover:bg-muted relative group">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Delete notification</span>
                    </Button>
                    <div className="font-medium pr-6">{notification.title}</div>
                    {notification.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {notification.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notification.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            {notificationData?.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-primary cursor-pointer">
                  View all notifications
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <form action={signOutAction}>
          <Button type="submit" variant="link" className="pl-3 text-white">
            Sign out
          </Button>
        </form>
      </div>

      {/* Mobile Navigation */}
      <div className="flex items-center md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="relative">
              <Bell color="#ffffff" className="w-5 h-5" />
              {notificationData?.length > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs">
                  {notificationData.length > 9 ? '9+' : notificationData.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notificationData?.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">No notifications</div>
            ) : (
              notificationData?.slice(0, 5).map((notification) => (
                <DropdownMenuItem key={notification.id} className="cursor-pointer p-0">
                  <div className="flex flex-col w-full p-2 hover:bg-muted relative group">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Delete notification</span>
                    </Button>
                    <div className="font-medium pr-6">{notification.title}</div>
                    {notification.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {notification.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notification.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            {notificationData?.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-primary cursor-pointer">
                  View all notifications
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-slate-800 p-0">
            <div className="flex flex-col space-y-4 p-4">
              <NavLinks />
              <form action={signOutAction} className="mx-auto">
                <Button type="submit" variant="link" className="text-white">
                  Sign out
                </Button>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}