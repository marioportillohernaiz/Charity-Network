"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "@/app/actions";
import { Badge } from "./ui/badge";

export default function UserMenu({ registeredCharity }: { registeredCharity: CharityData; }) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [clickedItem, setClickedItem] = useState<string | null>(null);

  const handleNavigation = (event: React.MouseEvent, path: string) => {
    event.preventDefault();
    setClickedItem(path);

    startTransition(() => {
      router.push(path);
    });
  };

  return (
    <>
    <Badge variant="secondary">Hi {registeredCharity?.name}</Badge>
    <Button asChild size="sm" variant={"link"} className="text-white" onClick={(e) => handleNavigation(e, "/protected")}>
      <span>
        {loading && clickedItem === "/protected" && <Loader2 className="h-4 w-4 animate-spin text-white mr-2" />}
        <Link href="/protected">Map</Link>
      </span>
    </Button>
    <Button asChild size="sm" variant={"link"} className="text-white" onClick={(e) => handleNavigation(e, "/protected/resource-page")}>
    <span>
      {loading && clickedItem === "/protected/resource-page" && <Loader2 className="h-4 w-4 animate-spin text-white mr-2" />}
      <Link href="/protected/resource-page">Resources</Link>
    </span>
    </Button>
    <Button asChild size="sm" variant={"link"} className="text-white" onClick={(e) => handleNavigation(e, "/protected/account-page")}>
      <span>
        {loading && clickedItem === "/protected/account-page" && <Loader2 className="h-4 w-4 animate-spin text-white mr-2" />}
        <Link href="/protected/account-page">Account</Link>
      </span>
    </Button>
    <Bell color="#ffffff" className="w-5 h-5 mr-2"/>
    <form action={signOutAction}>
      <Button type="submit" variant="link" className="pl-0 text-white">
        Sign out
      </Button>
    </form>
    </>
  );
}
