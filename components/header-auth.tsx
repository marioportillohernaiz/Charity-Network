import { getAuthUser, getNotificationData, getRegisteredCharity } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import UserMenu from "./user-menu";

export default async function AuthButton({ is_maintenance } : { is_maintenance: boolean; }) {
  const user = await getAuthUser();
  const registeredCharity = await getRegisteredCharity();
  const notificationData = await getNotificationData();

  return is_maintenance ? ( <p></p> ) : ( user ? (
    <div className="flex items-center gap-3">
      <UserMenu registeredCharity={registeredCharity} notificationData={notificationData} />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"link"} className="text-white">
        <Link href="/">Home</Link>
      </Button>
      <Button asChild size="sm" variant={"link"} className="text-white">
        <Link href="/sign-in">Log In</Link>
      </Button>
    </div>
  ));
}
