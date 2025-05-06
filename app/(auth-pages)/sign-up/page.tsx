// SIGN UP PAGE
// Allows users to register an account with a valid email and a secure password. The password must meet certain criteria.
// An email is sent to verify the email address is valid and accessible.

"use client"

import { signUpAction } from "@/app/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Check, X } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatedPassword, setRepeatedShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [passwordMatches, setPasswordMatches] = useState(false);
  const [passwordValid, setPasswordValid] = useState({length: false, uppercase: false, lowercase: false, number: false, special: false});

  useEffect(() => {
    setPasswordValid({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    });
    
    setPasswordMatches(password === repeatPassword && password !== "");
  }, [password, repeatPassword]);

  const isPasswordStrong = () => {
    return (
      passwordValid.length &&
      passwordValid.uppercase &&
      passwordValid.lowercase &&
      passwordValid.number &&
      passwordValid.special
    );
  };

  const handleSubmit = async (formData: FormData) => {
    if (!isPasswordStrong() || !passwordMatches) {
      toast.error("Please ensure your password meets all requirements and both passwords match.");
      return;
    }
    
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
      <div className="flex items-center justify-center py-8 sm:py-12 bg-[#064789] rounded-3xl mx-2 sm:mx-5">
        <div className="w-full max-w-[350px] px-4 sm:px-0 mx-auto grid gap-2">
          <h1 className="text-xl sm:text-2xl text-white font-medium">Sign up</h1>
          <p className="text-xs text-white sm:text-sm">
            Already have an account?{" "}
            <Link className="font-medium underline" href="/sign-in">
              Sign in
            </Link>
          </p>

          <form className="flex flex-col gap-2 [&>input]:mb-3 mt-6 sm:mt-8">
            <Label htmlFor="email" className="text-sm text-white">
              Business Email
            </Label>
            <Input id="email" name="email" placeholder="you@example.com" required className="text-sm" />

            <Label htmlFor="password" className="text-sm text-white">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="•••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-black text-sm"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-1 sm:right-2 flex items-center text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>

            {/* Password requirements checklist */}
            <div className="bg-white/10 text-white p-2 sm:p-3 rounded-md text-xs my-2">
              <p className="font-medium mb-1 sm:mb-2">Password must include:</p>
              <ul className="space-y-1">
                <li className="flex items-center">
                  {passwordValid.length ? (
                    <Check className="h-3 w-3 mr-1 sm:mr-2 text-green-400" />
                  ) : (
                    <X className="h-3 w-3 mr-1 sm:mr-2 text-red-400" />
                  )}
                  At least 8 characters
                </li>
                <li className="flex items-center">
                  {passwordValid.uppercase ? (
                    <Check className="h-3 w-3 mr-1 sm:mr-2 text-green-400" />
                  ) : (
                    <X className="h-3 w-3 mr-1 sm:mr-2 text-red-400" />
                  )}
                  At least one uppercase letter (A-Z)
                </li>
                <li className="flex items-center">
                  {passwordValid.lowercase ? (
                    <Check className="h-3 w-3 mr-1 sm:mr-2 text-green-400" />
                  ) : (
                    <X className="h-3 w-3 mr-1 sm:mr-2 text-red-400" />
                  )}
                  At least one lowercase letter (a-z)
                </li>
                <li className="flex items-center">
                  {passwordValid.number ? (
                    <Check className="h-3 w-3 mr-1 sm:mr-2 text-green-400" />
                  ) : (
                    <X className="h-3 w-3 mr-1 sm:mr-2 text-red-400" />
                  )}
                  At least one number (0-9)
                </li>
                <li className="flex items-center">
                  {passwordValid.special ? (
                    <Check className="h-3 w-3 mr-1 sm:mr-2 text-green-400" />
                  ) : (
                    <X className="h-3 w-3 mr-1 sm:mr-2 text-red-400" />
                  )}
                  At least one special character (!@#$%^&*)
                </li>
              </ul>
            </div>

            <Label htmlFor="repeatPassword" className="text-sm text-white">
              Repeat Password
            </Label>
            <div className="relative">
              <Input
                id="repeatPassword"
                type={showRepeatedPassword ? "text" : "password"}
                name="repeatPassword"
                placeholder="•••••••••"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
                className={`text-black text-sm ${repeatPassword && !passwordMatches ? "border-red-400" : ""}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute inset-y-0 right-1 sm:right-2 flex items-center text-black"
                onClick={() => setRepeatedShowPassword(!showRepeatedPassword)}
              >
                {showRepeatedPassword ? (
                  <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                <span className="sr-only">{showRepeatedPassword ? "Hide password" : "Show password"}</span>
              </Button>
            </div>

            {repeatPassword && (
              <div className={`text-xs ${passwordMatches ? "text-green-400" : "text-red-400"} flex items-center`}>
                {passwordMatches ? (
                  <><Check className="h-3 w-3 mr-1" />Passwords match</>
                ) : (
                  <><X className="h-3 w-3 mr-1" />Passwords do not match</>
                )}
              </div>
            )}

            <div className="flex items-start space-x-2 my-3 sm:my-4">
              <Checkbox id="consent" name="consent" required className="bg-white mt-0.5" />
              <Label htmlFor="consent" className="text-xs text-white leading-tight">
                * I confirm this account is for a registered charitable organisation.
              </Label>
            </div>

            <SubmitButton
              type="submit"
              formAction={handleSubmit}
              pendingText="Signing up..."
              variant="secondary"
              disabled={true}
            >
              Sign up
            </SubmitButton>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 items-center justify-center py-12">
        <Image src="/sign_up.svg" alt="Image" width="1920" height="1080" />
      </div>
    </div>
    <Toaster richColors expand={true} />
    </>
  );
}