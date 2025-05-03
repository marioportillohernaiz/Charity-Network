// FORGOT PASSWORD PAGE
// For MVP purposes, this page is available but the button is disabled to prevent change of passwords.

"use client"

import { forgotPasswordAction } from "@/app/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { InfoIcon } from "lucide-react";

export default function ForgotPassword() {
  const handleSubmit = async (formData: FormData) => {
    const response = await forgotPasswordAction(formData);
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };
  return (
    <>
      <form className="flex-1 flex flex-col w-full gap-2 text-foreground [&>input]:mb-6 min-w-64 max-w-64 mx-auto my-10">
        <div>
          <h1 className="text-2xl font-medium">Reset Password</h1>
          <p className="text-sm text-secondary-foreground">
            Already have an account?{" "}
            <Link className="text-primary underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <p className="text-sm text-red-500 flex gap-2">
            <InfoIcon className="h-4 w-4" />
            Button disabled for MVP purposes.
          </p>
          <SubmitButton type="submit" disabled={true} pendingText="Sending Email...">
            Reset Password
          </SubmitButton>
          <Toaster richColors />
        </div>
      </form>
    </>
  );
}
