// RESET PASSWORD PAGE
// For MVP purposes, this page is available but the button is disabled to prevent change of passwords.

import { resetPasswordAction } from "@/app/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoIcon } from "lucide-react";

export default async function ResetPassword(props: {
  searchParams: Promise<string>;
}) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
      <h1 className="text-2xl font-medium">Reset password</h1>
      <p className="text-sm text-foreground/60">
        Please enter your new password below.
      </p>
      <Label htmlFor="password">New password</Label>
      <Input
        type="password"
        name="password"
        placeholder="New password"
        required
      />
      <Label htmlFor="confirmPassword">Confirm password</Label>
      <Input
        type="password"
        name="confirmPassword"
        placeholder="Confirm password"
        required
      />

      <p className="text-sm text-red-500 flex gap-2">
        <InfoIcon className="h-4 w-4" />
        Button disabled for MVP purposes.
      </p>
      <SubmitButton disabled={true}> {/* formAction={resetPasswordAction} */}
        Reset password
      </SubmitButton>
    </form>
  );
}
