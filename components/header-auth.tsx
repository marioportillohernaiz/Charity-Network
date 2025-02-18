import { getAuthUser, getRegisteredCharity } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import UserMenu from "./user-menu";

export default async function AuthButton({ is_maintenance } : { is_maintenance: boolean; }) {
  const user = await getAuthUser();
  const registeredCharity = await getRegisteredCharity();

  return is_maintenance ? ( <p></p> ) : ( user ? (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex">
            <ChevronDown className="w-8 h-8 mt-1 text-white transition-transform" />
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>{registeredCharity?.name ? registeredCharity.name.slice(0, 2) : ""}</AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <UserMenu />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  ));
}
