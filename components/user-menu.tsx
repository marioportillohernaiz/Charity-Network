"use client";

import { signOutAction } from "@/app/actions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { DropdownMenuItem, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Home, Info, LogOut, MapPin, User, Users, Loader2 } from "lucide-react";
import Link from "next/link";

export default function UserMenu() {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleNavigation = (event: React.MouseEvent, path: string) => {
    event.preventDefault();
    setClickedItem(path);
    setOpen(true);

    startTransition(() => {
      router.push(path);
      setOpen(false);
    });
  };

  return (
    <>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator className="my-2 h-px bg-gray-200" />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={(e) => handleNavigation(e, "/protected/account-page")}>
          {loading && clickedItem === "/protected/account-page" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
          ) : (
            <User className="mr-2 h-4 w-4" />
          )}
          Profile
        </DropdownMenuItem>
        {/* 
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Support</span>

          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>

          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        */}
      </DropdownMenuGroup>

      <DropdownMenuSeparator className="my-2 h-px bg-gray-200" />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={(e) => handleNavigation(e, "/protected")}>
          {loading && clickedItem === "/protected" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="mr-2 h-4 w-4" />
          )}
          Eatery Map
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => handleNavigation(e, "/protected/community-page")}>
          {loading && clickedItem === "/protected/community-page" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Home className="mr-2 h-4 w-4" />
          )}
          Community Posts
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={(e) => handleNavigation(e, "/protected/about-page")}>
        {loading && clickedItem === "/protected/about-page" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Users className="mr-2 h-4 w-4" />
        )}
        Your Freeater Team
      </DropdownMenuItem>
      <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Info className="mr-2 h-4 w-4" />
          <Link href="#">More Items coming soon...</Link>
        </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" className="pl-0">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </form>
      </DropdownMenuItem>
    </>
  );
}
