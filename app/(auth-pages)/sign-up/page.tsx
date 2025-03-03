"use client"

import { signUpAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, InfoIcon } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { useState } from "react";
import { toast, Toaster } from "sonner";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatedPassword, setRepeatedShowPassword] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const response = await signUpAction(formData);
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  }

  return (
    <>
    <div className="w-full lg:grid lg:min-h-[500px] lg:grid-cols-2 xl:min-h-[500px]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-2">
          <h1 className="text-2xl font-medium">Sign up</h1>
          <p className="text-sm text text-foreground">
            Already have an account?{" "}
            <Link className="text-foreground font-medium underline" href="/sign-in">
              Sign in
            </Link>
          </p>
          
          <form className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
            <Label htmlFor="email">Business Email</Label>
            <Input name="email" placeholder="you@example.com" required />
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="•••••••••"
                minLength={6}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-2 flex items-center text-sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
            <Label htmlFor="repeatPassword">Repeat Password</Label>
            <div className="relative">
              <Input
                type={showRepeatedPassword ? "text" : "password"}
                name="repeatPassword"
                placeholder="•••••••••"
                minLength={6}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-2 flex items-center text-sm"
                onClick={() => setRepeatedShowPassword(!showRepeatedPassword)}
              >
                {showRepeatedPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showRepeatedPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
            <div className="flex items-center space-x-2 my-4">
              <Checkbox id="consent" name="consent" required />
              <Label htmlFor="consent" className="text-xs leading-none">
                * I confirm this account is for a registered charitable organisation.
              </Label>
            </div>
            <SubmitButton type="submit" formAction={handleSubmit} pendingText="Signing up...">
              Sign up
            </SubmitButton>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center py-12">
        <Image
          src="/sign_up.svg"
          alt="Image"
          width="1920"
          height="1080"
          // className="dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
    <Toaster richColors expand={true} />
    </>
  );
}
