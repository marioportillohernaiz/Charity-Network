"use client"

import { signInAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast, Toaster } from "sonner";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    const response = await signInAction(formData);
    if (!response.success) {
      toast.error(response.message);
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-[500px] lg:grid-cols-2 xl:min-h-[500px]">
      <div className="hidden lg:flex flex-1 items-center justify-center py-12">
        <Image
          src="/sign_in.svg"
          alt="Image"
          width="1920"
          height="1080"
          // className="dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex items-center justify-center py-12 bg-[#064789] rounded-lg mx-5">
        <form className="mx-auto grid w-[350px] gap-2 text-white">
          <h1 className="text-2xl font-medium">Sign in</h1>
          <p className="text-sm">
            Don't have an account?{" "}
            <Link className="font-medium underline" href="/sign-up">
              Sign up
            </Link>
          </p>
          <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
            <Label htmlFor="email">Email</Label>
            <Input name="email" placeholder="you@example.com" required />
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                className="text-xs underline"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="•••••••••"
                required />
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
            <SubmitButton pendingText="Signing In..." type="submit" formAction={handleSubmit} className="mt-5 text-black" variant="secondary">
              Sign in
            </SubmitButton>
            <Toaster richColors />
          </div>
        </form>
      </div>
    </div>
  );
}
