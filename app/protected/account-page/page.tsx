import { redirect } from "next/navigation";
import { getAuthUser, getRegisteredCharity } from "@/app/actions";
import AccountPage from "./AccountPage";

export default async function AccountLayout() {
  const user = await getAuthUser();
  const registeredCharity = await getRegisteredCharity();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <AccountPage accountData={registeredCharity!} />
  );
}