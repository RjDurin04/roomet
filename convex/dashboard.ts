
import { query } from "./_generated/server";
import { authComponent } from "./auth";

export const getOwnerStats = query({
  args: {},
  handler: async (ctx: any) => {
    // 1. Authenticate user
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("Unauthenticated")) return null;
      throw e;
    }
    
    if (!authUser) return null;

    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q: any) => q.eq("authUserId", authUser._id))
      .unique();

    if (!profile || profile.role !== "owner") return null;

    // 2. Fetch properties
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_ownerId", (q: any) => q.eq("ownerId", profile._id))
      .collect();

    const activePropertiesCount = properties.filter(
      (p: any) => p.status === "Active" || (p.isVisible && p.status !== "Inactive")
    ).length;

    // 3. Fetch reviews to calculate average rating
    let totalRating = 0;
    let reviewCount = 0;
    await Promise.all(
      properties.map(async (p: any) => {
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_propertyId", (q: any) => q.eq("propertyId", p._id))
          .collect();
        reviews.forEach((r: any) => {
          totalRating += r.rating;
          reviewCount++;
        });
      })
    );
    const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : "0.0";

    // 4. Fetch inquiries (conversations)
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_owner", (q: any) => q.eq("ownerId", profile._id))
      .collect();

    const activeConversations = conversations.filter((c: any) => !c.ownerDeleted);
    const inquiriesCount = activeConversations.length;

    // 5. Calculate monthly trends (last 6 months of inquiries)
    const now = new Date();
    const months: { month: string, year: number, monthNum: number, inquiries: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      // Get the month beginning
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        inquiries: 0,
      });
    }

    activeConversations.forEach((c: any) => {
      const date = new Date(c._creationTime);
      const m = months.find(
        (m: any) => m.monthNum === date.getMonth() && m.year === date.getFullYear()
      );
      if (m) {
        m.inquiries++;
      }
    });

    const monthlyTrends = months.map((m: any) => ({
      month: m.month,
      inquiries: m.inquiries,
    }));

    // 6. Hydrate top 5 recent inquiries
    const recentConversations = activeConversations
      .sort((a: any, b: any) => b.updatedAt - a.updatedAt)
      .slice(0, 5);

    const hydratedRecentInquiries = await Promise.all(
      recentConversations.map(async (conv: any) => {
        const property = properties.find((p: any) => p._id === conv.propertyId);
        const viewer = await ctx.db.get(conv.viewerId);

        // Count unread
        const cutoff = conv.ownerMessagesCutoff;
        let unreadMsgs = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q: any) => q.eq("conversationId", conv._id))
          .filter((q: any) =>
            q.and(
              q.eq(q.field("isRead"), false),
              q.neq(q.field("senderId"), profile._id)
            )
          )
          .collect();

        if (cutoff) {
          unreadMsgs = unreadMsgs.filter((m: any) => m._creationTime >= cutoff);
        }

        let lastMessageText = "Sent an attachment";
        if (conv.lastMessageId) {
          const lastMsg = await ctx.db.get(conv.lastMessageId);
          if (lastMsg && lastMsg.text) lastMessageText = lastMsg.text;
        }

        return {
          id: conv._id,
          user: viewer?.name || "Viewer",
          avatar:
            viewer?.image ||
            viewer?.image || undefined,
          property: property?.name || "Unknown Property",
          message: lastMessageText,
          unread: unreadMsgs.length > 0,
          updatedAt: conv.updatedAt,
        };
      })
    );

    return {
      activePropertiesCount,
      inquiriesCount,
      averageRating,
      monthlyTrends,
      recentInquiries: hydratedRecentInquiries,
    };
  },
});
