import { getAuthUser, getRegisteredCharity, signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default async function AuthButton({ is_maintenance } : { is_maintenance: boolean; }) {
  const user = await getAuthUser();
  const registeredCharity = await getRegisteredCharity();

  return is_maintenance ? ( <p></p> ) : ( user ? (
    <div className="flex items-center gap-4">
      <Badge variant="secondary">Hi {registeredCharity?.name}</Badge>
      <Button asChild size="sm" variant={"link"} className="text-white">
        <Link href="/">Map</Link>
      </Button>
      <Button asChild size="sm" variant={"link"} className="text-white">
        <Link href="/protected/resource-page">Resources</Link>
      </Button>
      <form action={signOutAction}>
        <Button type="submit" variant="link" className="pl-0 text-white">
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"link"} className="text-white">
        <Link href="/">Home</Link>
      </Button>
      <Button asChild size="sm" variant={"link"} className="text-white">
        <Link href="/map-page">Map</Link>
      </Button>
      <Button asChild size="sm" variant={"link"} className="text-white">
        <Link href="/sign-in">Account</Link>
      </Button>
    </div>
  ));
}
