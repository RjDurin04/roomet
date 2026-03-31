import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

// Helper to get authorized user (RES-M02b: unified auth pattern)
async function requireUser(ctx: MutationCtx | QueryCtx) {
  const authUser = await authComponent.getAuthUser(ctx);
  if (!authUser) throw new Error("Unauthorized");
  const user = await ctx.db
    .query("users")
    .withIndex("by_authUserId", (q: any) => q.eq("authUserId", authUser._id))
    .first();
  if (!user) throw new Error("User not found");
  return user;
}

export const toggle = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx: MutationCtx, args: { propertyId: any }) => {
    const user = await requireUser(ctx);
    
    // Check if bookmark exists
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_property", (q: any) => 
        q.eq("userId", user._id).eq("propertyId", args.propertyId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { action: "removed" };
    } else {
      await ctx.db.insert("bookmarks", {
        userId: user._id,
        propertyId: args.propertyId,
      });
      return { action: "added" };
    }
  },
});

export const check = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx: QueryCtx, args: { propertyId: any }) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("Unauthenticated")) return false;
      throw e;
    }
    if (!authUser) return false;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q: any) => q.eq("authUserId", authUser._id))
      .first();
      
    if (!user) return false;
    
    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_property", (q: any) => 
        q.eq("userId", user._id).eq("propertyId", args.propertyId)
      )
      .first();

    return !!existing;
  },
});

export const getUserBookmarks = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("Unauthenticated")) return [];
      throw e;
    }
    if (!authUser) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q: any) => q.eq("authUserId", authUser._id))
      .first();
      
    if (!user) return [];

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .collect();

    // Map properties for UI
    const properties = await Promise.all(
      bookmarks.map(async (bk: any) => {
        const p = await ctx.db.get(bk.propertyId);
        if (!p || p.status === "Deleted" || p.isVisible === false) return null;

        // Fetch image URLs
        let imageUrls: (string | null)[] = [];
        if (p.images && p.images.length > 0) {
          imageUrls = await Promise.all(
            p.images.map((id: any) => ctx.storage.getUrl(id))
          );
        }

        // Compute rating based on reviews
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_propertyId", (q: any) => q.eq("propertyId", p._id))
          .collect();
          
        let rating = 0;
        if (reviews.length > 0) {
           rating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
        }

        const isAvailable = p.rooms?.some((r: any) => (r.occupied ?? 0) < r.capacity) ?? false;
        
        let prices = [0];
        if (p.rooms && p.rooms.length > 0) {
           prices = p.rooms.map((r: any) => r.price);
        }

        return {
          id: p._id,
          name: p.name,
          address: p.location.address,
          images: imageUrls.filter(Boolean) as string[],
          amenities: p.amenities,
          rating: Number(rating.toFixed(1)), // Keep it rounded to 1 decimal
          available: isAvailable,
          priceRange: {
             min: Math.min(...prices)
          }
        };
      })
    );

    return properties.filter(Boolean) as NonNullable<typeof properties[number]>[];
  },
});
