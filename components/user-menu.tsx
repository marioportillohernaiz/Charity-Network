"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Bell, Loader2, Menu, X } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "@/app/actions";
import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export default function UserMenu({ registeredCharity }: { registeredCharity: CharityData; }) {
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

  // Navigation links to keep code DRY
  const NavLinks = () => (
    <>
      <Badge variant="secondary" className="mr-2">Hi {registeredCharity?.name}</Badge>

      <Button asChild size="sm" variant={"link"} className="text-white" onClick={(e) => handleNavigation(e, "/protected")}>
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
      </Button>
      
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
        <Badge variant="secondary" className="mr-2">Hi {registeredCharity?.name}</Badge>
        <NavLinks />
        <Bell color="#ffffff" className="w-5 h-5 mx-2"/>
        <form action={signOutAction}>
          <Button type="submit" variant="link" className="pl-0 text-white">
            Sign out
          </Button>
        </form>
      </div>

      {/* Mobile Navigation */}
      <div className="flex items-center md:hidden">
        <Bell color="#ffffff" className="w-5 h-5 mx-2"/>
        
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