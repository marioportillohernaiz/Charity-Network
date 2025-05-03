"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthMenu() {
  const [loading, setLoading] = useState(false);
  const [clickedItem, setClickedItem] = useState("");
  const router = useRouter();

  const handleNavigation = (event: React.MouseEvent, path: string) => {
    event.preventDefault();
    setClickedItem(path);

    startTransition(() => {
      router.push(path);
    });
  };

  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"link"} className="text-white" onClick={(e) => handleNavigation(e, "/")}>
        <span className="flex items-center">
          {loading && clickedItem === "/" && <Loader2 className="h-4 w-4 animate-spin text-white mr-2" />}
          <Link href="/">Home</Link>
        </span>
      </Button>
      <Button asChild size="sm" variant={"link"} className="text-white" onClick={(e) => handleNavigation(e, "/sign-in")}>
        <span className="flex items-center">
          {loading && clickedItem === "/sign-in" && <Loader2 className="h-4 w-4 animate-spin text-white mr-2" />}
          <Link href="/sign-in">Log In</Link>
        </span>
      </Button>
    </div>
  );
}