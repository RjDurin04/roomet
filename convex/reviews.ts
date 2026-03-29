import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const getByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_propertyId", (q) => q.eq("propertyId", args.propertyId))
      .order("desc")
      .collect();
  },
});

export const getStats = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_propertyId", (q) => q.eq("propertyId", args.propertyId))
      .collect();
      
    if (reviews.length === 0) {
      return { rating: 0, count: 0 };
    }
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return {
      rating: Number((sum / reviews.length).toFixed(1)),
      count: reviews.length,
    };
  },
});

export const create = mutation({
  args: {
    propertyId: v.id("properties"),
    rating: v.number(),
    comment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("You must be logged in to leave a review");
    }

    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .unique();

    if (!profile) {
      throw new Error("User profile not found");
    }

    // RES-M05: Validate inputs server-side
    if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
      throw new Error("Rating must be an integer between 1 and 5");
    }
    if (args.comment && args.comment.length > 2000) {
      throw new Error("Review comment too long (max 2000 characters)");
    }

    // Check if property exists
    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Property not found");
    }

    // Check if user already reviewed
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_property_user", (q) => 
        q.eq("propertyId", args.propertyId).eq("userId", profile._id)
      )
      .unique();

    if (existingReview) {
      return existingReview._id;
    }

    // Insert review
    const reviewId = await ctx.db.insert("reviews", {
      propertyId: args.propertyId,
      userId: profile._id,
      rating: args.rating,
      comment: args.comment,
      createdAt: Date.now(),
      userName: authUser.name || "Anonymous User",
      userImage: authUser.image || undefined,
    });

    // Send notification to Owner
    await ctx.db.insert("notifications", {
      userId: property.ownerId,
      type: "new_review",
      title: "New Review Received",
      body: `${authUser.name || "A tenant"} left a ${args.rating}-star review on ${property.name}.`,
      link: `/owner/reviews?reviewId=${reviewId}`,
      isRead: false,
      createdAt: Date.now(),
    });

    return reviewId;
  },
});

export const getUserReviews = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", identity.subject))
      .first();

    if (!user) return [];

    const reviews = await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .order("desc")
      .collect();

    const hydrated = await Promise.all(
      reviews.map(async (review) => {
        const property = await ctx.db.get(review.propertyId);
        if (!property) return null;

        return {
          ...review,
          propertyName: property.name,
        };
      })
    );

    return hydrated.filter(Boolean) as any[];
  },
});

export const getOwnerReviews = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) return [];

    const owner = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .unique();

    if (!owner) return [];

    const properties = await ctx.db
      .query("properties")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", owner._id))
      .collect();

    const allReviews = await Promise.all(
      properties.map(async (p) => {
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_propertyId", (q) => q.eq("propertyId", p._id))
          .collect();
        
        return reviews.map(r => ({
          ...r,
          propertyName: p.name,
          status: r.status || "Published",
        }));
      })
    );

    return allReviews.flat().sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const replyToReview = mutation({
  args: { reviewId: v.id("reviews"), reply: v.string() },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Unauthorized");

    if (args.reply.length > 2000) {
      throw new Error("Reply too long (max 2000 characters)");
    }

    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");

    const property = await ctx.db.get(review.propertyId);
    if (!property) throw new Error("Property not found");

    if (property.ownerId !== profile._id) {
      throw new Error("Only the property owner can reply to reviews");
    }

    await ctx.db.patch(args.reviewId, { reply: args.reply });

    await ctx.db.insert("notifications", {
      userId: review.userId,
      type: "review_reply",
      title: "Owner Replied",
      body: `The owner replied to your review.`,
      link: `/tenant/map/roomet/${review.propertyId}?tab=reviews&reviewId=${review._id}`,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const reportReview = mutation({
  args: { reviewId: v.id("reviews") },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .unique();
    if (!profile) throw new Error("Profile not found");

    const review = await ctx.db.get(args.reviewId);
    if (!review) throw new Error("Review not found");

    const property = await ctx.db.get(review.propertyId);
    if (!property) throw new Error("Property not found");

    if (property.ownerId !== profile._id) {
      throw new Error("Only the property owner can report reviews");
    }

    await ctx.db.patch(args.reviewId, { status: "Reported" });
  },
});
