import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Home, Info, LogOut, MapPin, User, Users } from "lucide-react";
import UserMenu from "./user-menu";

export default async function AuthButton({ is_maintenance, userIsBusiness } : { is_maintenance: boolean; userIsBusiness: boolean; }) {
  const {
    data: { user },
  } = await createClient().auth.getUser();

  const supabase = createClient();
  const { data: existingUser } = await supabase
    .from("registered_users")
    .select("first_name")
    .eq("id", user?.id)
    .single();

  const { data: existingEatery } = await supabase
    .from("eatery_map")
    .select("name")
    .eq("owner_id", user?.id)
    .single();

  return is_maintenance ? ( <p></p> ) : ( user ? (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex">
            <ChevronDown className="w-8 h-8 mt-1 text-white transition-transform" />
            <Avatar>
              <AvatarImage src="" />
              { userIsBusiness ? <AvatarFallback>{existingEatery?.name.slice(0, 2)}</AvatarFallback> : <AvatarFallback>{existingUser?.first_name.slice(0, 2)}</AvatarFallback> }
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <UserMenu signOutAction={signOutAction} />
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
