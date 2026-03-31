import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Get the current user's app profile (including role)
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch (e: unknown) {
      // getAuthUser throws if not authenticated. We want it to be optional for getMyProfile.
      if (e instanceof Error && e.message.includes("Unauthenticated")) {
        return null;
      }
      throw e;
    }
    
    if (!authUser) return null;

    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .unique();
      


    return {
      ...authUser,
      profileId: profile?._id ?? null,
      role: profile?.role ?? null,
      onboardingComplete: profile?.onboardingComplete ?? !!profile?.role,
      name: profile?.name,
      image: profile?.image,
    };
  },
});

// Passively sync BetterAuth user fields into convex users DB
export const syncProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) return;

    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .unique();

    if (profile) {
      if (profile.name !== args.name || profile.image !== args.image) {
        await ctx.db.patch(profile._id, { name: args.name, image: args.image });
      }
    }
  },
});

// Set the user's role during onboarding
export const setRole = mutation({
  args: {
    role: v.union(v.literal("viewer"), v.literal("owner")),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Check if profile already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .unique();
      


    if (existing) {
      // Update existing profile
      await ctx.db.patch(existing._id, {
        role: args.role,
        onboardingComplete: true,
      });
    } else {
      // Create new profile
      await ctx.db.insert("users", {
        authUserId: authUser._id,
        role: args.role,
        onboardingComplete: true,
      });
    }
  },
});



export const generateUploadUrl = mutation(async (ctx) => {
  const authUser = await authComponent.getAuthUser(ctx);
  if (!authUser) throw new Error("Not authenticated");
  return await ctx.storage.generateUploadUrl();
});

export const updateProfileImage = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("Failed to get image URL");

    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, { image: imageUrl });
    }

    return imageUrl;
  },
});
