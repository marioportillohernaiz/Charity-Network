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
    <div className="w-full min-h-[400px] md:min-h-[450px] lg:grid lg:min-h-[500px] lg:grid-cols-2 xl:min-h-[500px]">
      <div className="hidden lg:flex flex-1 items-center justify-center py-12">
        <Image
          src="/sign_in.svg"
          alt="Image"
          width="1920"
          height="1080"
          // className="dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex items-center justify-center py-8 sm:py-12 bg-[#064789] rounded-3xl mx-3 sm:mx-5">
        <form className="mx-auto grid w-full max-w-[350px] gap-2 px-4 sm:px-0">
          <h1 className="text-xl sm:text-2xl text-white font-medium">Sign in</h1>
          <p className="text-sm text-white">
            Don't have an account?{" "}
            <Link className="font-medium underline" href="/sign-up">
              Sign up
            </Link>
          </p>
          <div className="flex flex-col gap-2 [&>input]:mb-3 mt-6 sm:mt-8">
            <Label htmlFor="email" className="text-sm text-white sm:text-base">
              Email
            </Label>
            <Input id="email" name="email" className="text-black h-10 sm:h-11" placeholder="you@example.com" required />
            <div className="flex justify-between items-center mt-1">
              <Label htmlFor="password" className="text-sm text-white sm:text-base">
                Password
              </Label>
              <Link className="text-xs text-white underline" href="/forgot-password">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="•••••••••"
                className="text-black h-10 sm:h-11"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-2 flex items-center text-sm text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>
            <SubmitButton
              pendingText="Signing In..."
              type="submit"
              formAction={handleSubmit}
              className="mt-4 sm:mt-5 text-black h-10 sm:h-11"
              variant="secondary"
            >
              Sign in
            </SubmitButton>
            <Toaster richColors />
          </div>
        </form>
      </div>
    </div>
  );
}
