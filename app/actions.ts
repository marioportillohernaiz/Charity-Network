"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { format } from 'date-fns-tz';

const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'Europe/Paris' })

// Any sort of database fetch
export const getAuthUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const getAllCharities = async () => {
  const supabase = await createClient();

  const { data: charities } = await supabase
    .from("registered_charities")
    .select("*") as { data: CharityData[] | []; error: any };;

  return charities;
};

export const getRegisteredCharity = async () => {
  const user = await getAuthUser();
  const supabase = await createClient();

  const { data: registeredCharity, error } = await supabase
    .from("registered_charities")
    .select("*")
    .eq("owner_id", user?.id)
    .single() as { data: CharityData; error: any };

  return registeredCharity;
};

export const getCommentData = async () => {
  const supabase = await createClient();

  const { data: comments } = await supabase
    .from("review_comments")
    .select("*") as { data: ReviewComments[] | []; error: any };;

  return comments;
};

export const getCharityResourceData = async () => {
  const supabase = await createClient();
  const charity = await getRegisteredCharity();

  const { data: resources } = await supabase
    .from("resources")
    .select("*") 
    .eq("charity_id", charity.id) as { data: ResourcesData[] | []; error: any };;
  
  return resources;
};

export const getAllResourceData = async () => {
  const supabase = await createClient();

  const { data: resourceData } = await supabase
    .from("resources")
    .select("*") as { data: ResourcesData[] | []; error: any };
  
  return resourceData || [];
};

export const getResourceTransitData = async () => {
  const supabase = await createClient();

  const { data: resource_transit } = await supabase
    .from("resource_transit")
    .select("*") as { data: TransitData[] | []; error: any };
  
  return resource_transit;
};

export const getNotificationData = async () => {
  const supabase = await createClient();
  const charity = await getRegisteredCharity();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("charity_id", charity?.id) as { data: NotificationData[]; error: any };
  
  const sortedNotifications = notifications?.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) || [];
  
  return sortedNotifications;
};

export const getSalesData = async () => {
  const supabase = await createClient();
  const charity = await getRegisteredCharity();

  const { data: sales } = await supabase
    .from("sales_register")
    .select("*")
    .eq("charity_id", charity?.id) as { data: Sales[]; error: any };
  
  return sales;
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
    return { success: false, message: "Email is required" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return { success: false, message: "Could not reset password" };
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return { success: true, message: "Check your email for a link to reset your password." };
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

// BROKEN
export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export async function submitCharity(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  const name = formData.get("name") as string || "";
  const description = formData.get("description") as string || "";
  const longitude = Number(formData.get("longitude")) || 0;
  const latitude = Number(formData.get("latitude")) || 0;
  const address = formData.get("address") as string;
  const openingHours = JSON.parse(formData.get("openingHours") as string || `["[]"]`);
  const phone = formData.get("phone") as string || "";
  const email = formData.get("email") as string || "";
  const facebook = formData.get("facebook") as string || "";
  const twitter = formData.get("twitter") as string || "";
  const instagram = formData.get("instagram") as string || "";
  const website = formData.get("website") as string || "";
  const category = JSON.parse(formData.get("category") as string);
  const settings = JSON.parse(formData.get("settings") as string);

  const starRating = Number(formData.get("starRating")) || 0;
  // const timeZone = getTimeZoneValue();

  if (authError || !user) {
    return redirect("/sign-in");
  } else {
    const { data: existingCharity } = await supabase
      .from("registered_charities")
      .select("*")
      .eq("owner_id", user?.id)
      .single(); 
  
    if (!existingCharity) {
      // Insert an charity
      const { error } = await supabase
        .from("registered_charities")
        .insert({
          name: name,
          description: description,
          latitude: latitude,
          longitude: longitude,
          address: address,
          opening_hours: openingHours,
          email: email,
          phone_number: phone,
          website_link: website,
          rating: starRating,
          total_rating: starRating == 0 ? 0 : 1,
          admin_verified: false,
        });
      
      if (error) {
        console.log(error);
        return { success: false, message: "Error Adding Charity" };
      } else {
        return { success: true, message: "Charity Successfully Added" };
      }
    } else {
      const { error } = await supabase
        .from("registered_charities")
        .update({
          name: name,
          description: description,
          latitude: latitude,
          longitude: longitude,
          address: address,
          opening_hours: openingHours,
          email: email,
          phone_number: phone,
          website_link: website,
          facebook_link: facebook,
          twitter_link: twitter,
          instagram_link: instagram,
          category_and_tags: category,
          settings: settings,
          updated_at: now
        })
        .eq("id", existingCharity.id);
      
      if (error) {
        console.log(error);
        return { success: false, message: "Error Updating Charity" };
      } else {
        return { success: true, message: "Charity Successfully Updated" };
      }
    }
  }
}

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const user = await getAuthUser();

  const charityId = formData.get("charityId") as string || null;
  const comment = formData.get("commentText") as string;
  const starRating = Number(formData.get("starRating")) || 0;  

  if (!user) {
    return redirect("/sign-in");
  } else {
    const { data: existingCharity } = await supabase
      .from("registered_charities")
      .select("*")
      .eq("id", charityId)
      .single();

    const newTotalRating = existingCharity.total_rating + 1;
    const newAverageRating = (((existingCharity.total_rating as number)* (existingCharity.rating as number)) + starRating) / (existingCharity.total_rating + 1);
    
    // Update charity rating
    const { error: ratingError } = await supabase
      .from("registered_charities")
      .update({ rating: newAverageRating, total_rating: newTotalRating })
      .eq("id", charityId);

    if (ratingError) {
      console.log(ratingError);
      return { success: false, message: "Error Fetching Review" };
    }

    // Insert a comment
    if (comment != "") {
      const { error } = await supabase
        .from("review_comments")
        .insert({
          charity_id: charityId,
          comment: comment,
          rating: starRating,
        });

      if (error) {
        console.log(error);
        return { success: false, message: "Error Adding Review" };
      } else {
        return { success: true, message: "Comment Successfully Added" };
      }
    }
    return { success: false, message: "Error" };
  }  
}

export async function submitResource(formData: FormData) {
  const supabase = await createClient();
  const user = await getAuthUser();
  const charity = await getRegisteredCharity();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const quantity = Number(formData.get("quantity"));
  const reservedQuantity = Number(formData.get("reservedQuantity")) || 0;
  const unit = formData.get("unit") as string;
  const shareableQuantity = Number(formData.get("shareableQuantity")) || 0;
  const location = formData.get("location") as string;
  const expiryDate = formData.get("expiryDate") as string;

  if (!user) {
    return redirect("/sign-in");
  } else {
    const { data: existingResource } = await supabase
      .from("resources")
      .select("*")
      .eq("id", id)
      .single();

    if (existingResource) {
      const { error } = await supabase
      .from("resources")
      .update({
        name: name,
        description: description,
        category: category,
        quantity: quantity,
        quantity_reserved: reservedQuantity,
        unit: unit,
        shareable_quantity: shareableQuantity,
        location: location,
        expiry_date: new Date(expiryDate),
        updated_at: now
      })
      .eq("id", existingResource.id);

      if (error) {
        console.log(error);
        return { success: false, message: "Error Adding Resource" };
      } else {
        return { success: true, message: "Resource Successfully Updated" };
      }
    } else {
      // Insert a resource
      const { error } = await supabase
      .from("resources")
      .insert({
        charity_id: charity.id,
        name: name,
        description: description,
        category: category,
        quantity: quantity,
        quantity_reserved: reservedQuantity,
        unit: unit,
        shareable_quantity: shareableQuantity,
        location: location,
        expiry_date: new Date(expiryDate),
        updated_at: now
      });

      if (error) {
        console.log(error);
        return { success: false, message: "Error Adding Resource" };
      } else {
        return { success: true, message: "Resource Successfully Added" };
      }
    }
  }  
}

export async function rejectTransit(id: string) {
  const supabase = await createClient();
  const user = await getAuthUser(); 

  if (!user) {
    return redirect("/sign-in");
  } else {
    const { data: existingTransit } = await supabase
      .from("resource_transit")
      .select("*")
      .eq("id", id)
      .single();

    if (existingTransit) {
      const { error } = await supabase
        .from("resource_transit")
        .update({
          status: "Rejected"
        })
        .eq("id", id);

      if (error) {
        console.log(error);
        return { success: false, message: "Error Rejecting Transit" };
      } else {
        return { success: true, message: "Transit Rejected" };
      }
    } else {
      return { success: false, message: "Error Fetching Transit" };
    }
  }  
}

export async function dispatchTransit(id: string, resource: ResourcesData | undefined) {
  const supabase = await createClient();
  const user = await getAuthUser(); 

  if (!user) {
    return redirect("/sign-in");
  } else {
    const { data: existingTransit } = await supabase
      .from("resource_transit")
      .select("*")
      .eq("id", id)
      .single();

    const { data: existingResource } = await supabase
      .from("resources")
      .select("*")
      .eq("id", resource?.id)
      .single();

    if (existingTransit && existingResource) {
      const { error } = await supabase
        .from("resource_transit")
        .update({
          status: "In transit",
          time_sent: now,
          updated_at: now,
        })
        .eq("id", id);

      const { error: errorResource } = await supabase
        .from("resources")
        .update({
          quantity_reserved: existingResource.quantity_reserved - existingTransit.quantity,
          updated_at: now,
        })
        .eq("id", resource?.id);

      if (error || errorResource) {
        console.log(error);
        return { success: false, message: "Error Dispatching Transit" };
      } else {
        return { success: true, message: "Transit Dispatched" };
      }
    } else {
      return { success: false, message: "Error Fetching Transit" };
    }
  }  
}

export async function receiveTransit(id: string, resource: ResourcesData | undefined) {
  const supabase = await createClient();
  const user = await getAuthUser(); 

  if (!user) {
    return redirect("/sign-in");
  } else {
    const { data: existingTransit } = await supabase
      .from("resource_transit")
      .select("*")
      .eq("id", id)
      .single();

    const { data: existingResource } = await supabase
      .from("resources")
      .select("*")
      .eq("id", resource?.id)
      .single();

    if (existingTransit && existingResource) {
      const { error } = await supabase
        .from("resource_transit")
        .update({
          status: "Received",
          time_received: now,
          updated_at: now,
        })
        .eq("id", id);

      if (error) {
        console.log(error);
        return { success: false, message: "Error Receiveing Transit" };
      } else {
        return { success: true, message: "Transit Received" };
      }
    } else {
      return { success: false, message: "Error Fetching Transit" };
    }
  }  
}

export async function requestResource(resource: ResourcesData | null, requestQuantity: number, notes: string) {
  const supabase = await createClient();
  const user = await getAuthUser(); 
  const charity = await getRegisteredCharity();

  if (!user) {
    return redirect("/sign-in");
  } else {    
    if (resource) {
      const { error } = await supabase
        .from("resource_transit")
        .insert({
          resource_id: resource.id,
          charity_from: resource.charity_id,
          charity_to: charity.id,
          quantity: requestQuantity,
          status: "Requested",
          description: notes,
          can_expire: resource.expiry_date ? true : false,
          time_sent: null,
          time_received: null,
          updated_at: now,
        });

      const { error: errorCharity } = await supabase
        .from("resources")
        .update({
          quantity_reserved: resource.quantity_reserved + requestQuantity,
          shareable_quantity: resource.shareable_quantity - requestQuantity,
          updated_at: now,
        })
        .eq("id", resource.id);

      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          charity_id: resource.charity_id,
          title: "Resource Requested",
          description: `${charity.name} has requested ${requestQuantity} ${resource.name}`,
          created_at: now,
        });

      if (error || errorCharity ||notifError) { 
        console.log(error);
        console.log(errorCharity);
        console.log(notifError);
        return { success: false, message: "Error Requesting Resrource" };
      } else {
        return { success: true, message: "Resource Requested" };
      }
    } else {
      return { success: false, message: "Error Fetching Request" };
    }
  }  
}

export async function submitSales(formData: FormData) {
  const supabase = await createClient();
  const user = await getAuthUser(); 
  const charity = await getRegisteredCharity();

  const sales_data = JSON.parse(formData.get("sales_data") as string || `["{}"]`);
  const date_from = formData.get("date_from");
  const date_to = formData.get("date_to");

  if (!user) {
    return redirect("/sign-in");
  } else {
    const { error } = await supabase
    .from("sales_register")
    .insert({
      charity_id: charity.id,
      sales_data: sales_data,
      date_from: date_from,
      date_to: date_to,
      created_at: now,
    });

    if (error) {
      console.log(error);
      return { success: false, message: "Error registering sales" };
    } else {
      return { success: true, message: "Sales registered successfully" };
    }
  }   
}

export async function deleteNotification(id: string) {
  const supabase = await createClient();
  const user = await getAuthUser(); 

  if (!user) {
    return redirect("/sign-in");
  } else {
    const { data: existingNotification } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", id)
      .single();

    if (existingNotification) {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) {
        console.log(error);
        return { success: false, message: "Error Deleting Notification" };
      } else {
        return { success: true, message: "Notification Deleted" };
      }
    } else {
      return { success: false, message: "Error Fetching Notification" };
    }
  }  
}