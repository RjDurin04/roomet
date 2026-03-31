import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const get = query({
  args: {},
  handler: async (ctx) => {
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
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.optional(v.id("notifications")) },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .unique();

    if (!user) throw new Error("User not found");

    if (args.notificationId) {
      const notification = await ctx.db.get(args.notificationId);
      if (notification && notification.userId === user._id) {
        await ctx.db.patch(args.notificationId, { isRead: true });
      }
    } else {
      // Mark all as read
      const unread = await ctx.db
        .query("notifications")
        .withIndex("by_userId_isRead", (q) => 
          q.eq("userId", user._id).eq("isRead", false)
        )
        .collect();
        
      for (const notification of unread) {
        await ctx.db.patch(notification._id, { isRead: true });
      }
    }
  },
});
