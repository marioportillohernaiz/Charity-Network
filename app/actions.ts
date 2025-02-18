"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Any sort of database fetch
export const getAuthUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const getAllCharities = async () => {
  const user = await getAuthUser();
  const supabase = await createClient();

  const { data: charities } = await supabase
    .from("registered_users")
    .select("*") as { data: CharityData[] | []; error: any };;

  return charities;
};

export const getRegisteredCharity = async () => {
  const user = await getAuthUser();
  const supabase = await createClient();

  const { data: registeredCharity } = await supabase
    .from("registered_users")
    .select("*")
    .eq("id", user?.id)
    .single() as { data: CharityData | null; error: any };;

  return registeredCharity;
};

// Any sort of form actions & database insert/update/delete
export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return { success: true, message: "Thanks for signing up! Please check your email for a verification link." };
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.toString() };
  }

  return redirect("/protected");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export async function submitCharity(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  const eateryId = formData.get("eateryId") as string || null;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string || "";
  const longitude = Number(formData.get("longitude")) || 0;
  const latitude = Number(formData.get("latitude")) || 0;
  const address = formData.get("address") as string;
  const openingHours = JSON.parse(formData.get("openingHours") as string || `["[]"]`);
  const starRating = Number(formData.get("starRating")) || 0;
  const phone = formData.get("phone") as string || "";
  const website = formData.get("website") as string || "";

  const eateryRequested = formData.get("eateryRequested") === "true";

  if ((authError || !user) && !eateryRequested) {
    return redirect("/sign-in");
  } else {
    const { data: existingEatery } = await supabase
      .from("eatery_map")
      .select("*")
      .eq("owner_id", user?.id)
      .single();
  
    if (!existingEatery) {
      // Insert an eatery
      // const { error } = await supabase
      //   .from("eatery_map")
      //   .insert({
      //     id: eateryId,
      //     name: name,
      //     description: description,
      //     latitude: latitude,
      //     longitude: longitude,
      //     address: address,
      //     opening_hours: openingHours,
      //     rating: starRating,
      //     total_rating: eateryRequested ? 0 : 1,
      //     phone_number: phone,
      //     website_link: website,
      //     admin_verified: false,
      //   });
      
      // if (error) {
      //   console.log(error);
      //   return { success: false, message: "Error Adding Eatery" };
      // } else {
        return { success: true, message: "Eatery Successfully Added" };
      // }
    } else {
      // const { error } = await supabase
      //   .from("eatery_map")
      //   .update({
      //     name: name,
      //     description: description,
      //     latitude: latitude,
      //     longitude: longitude,
      //     address: address,
      //     opening_hours: openingHours,
      //     phone_number: phone,
      //     website_link: website,
      //   })
      //   .eq("id", existingEatery.id);
      
      // if (error) {
      //   console.log(error);
      //   return { success: false, message: "Error Updating Eatery" };
      // } else {
        return { success: true, message: "Eatery Successfully Updated" };
      // }
    }
  }  
}