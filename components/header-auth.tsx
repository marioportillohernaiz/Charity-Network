import { getAuthUser, getNotificationData, getRegisteredCharity } from "@/app/actions";
import UserMenu from "./user-menu";
import AuthMenu from "./auth-menu";

export default async function AuthButton({ is_maintenance } : { is_maintenance: boolean; }) {
  const user = await getAuthUser();
  const registeredCharity = await getRegisteredCharity();
  const notificationData = await getNotificationData();

  return is_maintenance ? ( <p></p> ) : ( user ? (
    <div className="flex items-center gap-3">
      <UserMenu registeredCharity={registeredCharity} notificationData={notificationData} />
    </div>
  ) : (
    <AuthMenu />
  ));
}
