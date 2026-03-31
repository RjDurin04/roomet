import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
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

export const create = mutation({
  args: { 
    propertyId: v.id("properties"),
    message: v.optional(v.string())
  },
  handler: async (ctx: MutationCtx, args: { propertyId: any; message?: string }) => {
    const user = await requireUser(ctx);
    
    // Validate property exists
    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("Property not found");

    if (user.role === "owner" && property.ownerId === user._id) {
       throw new Error("Owners cannot inquire about their own properties.");
    }

    // Check if conversation already exists
    let convId;
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_viewer_property", (q: any) => 
        q.eq("viewerId", user._id).eq("propertyId", args.propertyId)
      )
      .unique();

    if (existing) {
      convId = existing._id;
      if (existing.status === "archived" || existing.ownerDeleted || existing.viewerDeleted) {
         await ctx.db.patch(existing._id, { 
           status: "active", 
           updatedAt: Date.now(),
           viewerDeleted: false,
           ownerDeleted: false
         });
      }
    } else {
      // Create a new conversation
      convId = await ctx.db.insert("conversations", {
        propertyId: args.propertyId,
        viewerId: user._id,
        ownerId: property.ownerId,
        status: "active",
        updatedAt: Date.now(),
      });
    }

    // If an initial message is provided, send it
    if (args.message) {
      const messageId = await ctx.db.insert("messages", {
        conversationId: convId,
        senderId: user._id,
        text: args.message,
        isRead: false,
        createdAt: Date.now(),
      });

      await ctx.db.patch(convId, {
        lastMessageId: messageId,
        updatedAt: Date.now(),
      });
      
      // Also notify the owner
      await ctx.db.insert("notifications", {
        userId: property.ownerId,
        type: "new_message",
        title: "New Inquiry",
        body: `${user.name || "A user"} inquired about ${property.name}.`,
        link: "/owner/inquiries",
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return convId;
  },
});

export const sendMessage = mutation({
  args: { 
    conversationId: v.id("conversations"),
    text: v.optional(v.string()),
    image: v.optional(v.id("_storage")),
    images: v.optional(v.array(v.id("_storage")))
  },
  handler: async (ctx: any, args: any) => {
    const user = await requireUser(ctx);
    
    if (!args.text && !args.image && (!args.images || args.images.length === 0)) {
       throw new Error("Message must contain text or image");
    }

    // RES-M05: Validate text length and sanitize control characters
    if (args.text) {
      if (args.text.length > 5000) {
        throw new Error("Message too long (max 5000 characters)");
      }
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    // Verify participant
    if (conversation.viewerId !== user._id && conversation.ownerId !== user._id) {
       throw new Error("Unauthorized participant");
    }

    const payload: Record<string, unknown> = {
       conversationId: args.conversationId,
       senderId: user._id,
       isRead: false,
       createdAt: Date.now(),
    };
    if (args.text !== undefined) payload['text'] = args.text;
    if (args.image !== undefined) payload['image'] = args.image;
    if (args.images !== undefined) payload['images'] = args.images;

    const messageId = await ctx.db.insert("messages", payload);

    const isSenderViewer = conversation.viewerId === user._id;

    await ctx.db.patch(args.conversationId, {
       lastMessageId: messageId,
       updatedAt: Date.now(),
       ...(isSenderViewer ? { ownerDeleted: false } : { viewerDeleted: false })
    });

    const recipientId = isSenderViewer ? conversation.ownerId : conversation.viewerId;
    const roleLink = isSenderViewer ? "/owner/inquiries" : "/tenant/inquiries";
    
    await ctx.db.insert("notifications", {
      userId: recipientId,
      type: "new_message",
      title: "New Message",
      body: `${user.name || "A user"} sent you a message.`,
      link: roleLink,
      isRead: false,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx: any, args: any) => {
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
    const localUserId = user?._id;

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return [];

    const isViewer = conversation.viewerId === localUserId;
    const isOwner = conversation.ownerId === localUserId;
    const cutoff = isViewer ? conversation.viewerMessagesCutoff : (isOwner ? conversation.ownerMessagesCutoff : undefined);

    // RES-H05: Paginate to latest 200 messages (over-fetch for cutoff filtering)
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_conversation", q => q.eq("conversationId", args.conversationId))
      .order("desc")
      .take(200);

    let visibleMsgs = msgs;
    if (cutoff) {
       visibleMsgs = (msgs as any[]).filter((m: any) => m._creationTime >= cutoff);
    }

    // Cap at 100 for display
    const paginated = visibleMsgs.slice(0, 100);

    // Format them
    const formatted = await Promise.all(paginated.map(async (m: any) => {
       let imageUrl = undefined;
       if (m.image) {
          imageUrl = await ctx.storage.getUrl(m.image);
       }
       const imageUrls = m.images ? await Promise.all(m.images.map((id: any) => ctx.storage.getUrl(id))) : [];

       return {
         id: m._id,
         senderId: m.senderId,
         isMine: m.senderId === localUserId,
         text: m.text,
         imageUrl,
         imageUrls: imageUrls.filter(Boolean) as string[],
         isRead: m.isRead,
         createdAt: m._creationTime,
       };
    }));

    // Reverse for chronological order (fetched desc)
    return formatted.reverse();
  },
});

export const deleteConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx: any, args: any) => {
    const user = await requireUser(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");
    
    // Only participants can delete
    const isViewer = conversation.viewerId === user._id;
    const isOwner = conversation.ownerId === user._id;

    if (!isViewer && !isOwner) {
       throw new Error("Unauthorized");
    }

    // Tag the soft delete flags and cutoffs
    if (isViewer) {
       await ctx.db.patch(args.conversationId, { viewerDeleted: true, viewerMessagesCutoff: Date.now() });
    } else {
       await ctx.db.patch(args.conversationId, { ownerDeleted: true, ownerMessagesCutoff: Date.now() });
    }

    // RES-C05: Phase-separate transactional DB ops from best-effort storage cleanup
    const updated = await ctx.db.get(args.conversationId);
    if (updated?.viewerDeleted && updated?.ownerDeleted) {
       const msgs = await ctx.db
         .query("messages")
         .withIndex("by_conversation", (q: any) => q.eq("conversationId", args.conversationId))
         .collect();

       // Phase 1: Collect storage IDs before deleting records
       const storageIdsToDelete: string[] = [];
       for (const msg of msgs) {
          if (msg.image) storageIdsToDelete.push(msg.image);
          if (msg.images) storageIdsToDelete.push(...msg.images);
       }

       // Phase 2: Delete all DB records (transactional in Convex)
       for (const msg of msgs) {
          await ctx.db.delete(msg._id);
       }
       await ctx.db.delete(args.conversationId);

       // Phase 3: Best-effort storage cleanup (non-transactional)
       for (const storageId of storageIdsToDelete) {
          try {
            await ctx.storage.delete(storageId);
          } catch {
            console.error(`[inquiries.deleteConversation] Failed to delete storage blob: ${storageId}`);
          }
       }
    }
  }
});

export const markAsRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx: MutationCtx, args: { conversationId: Id<"conversations"> }) => {
    const user = await requireUser(ctx);

    // DI-013: Bounded processing for long conversations
    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q: any) => q.eq("conversationId", args.conversationId))
      .filter((q: any) => q.and(
        q.eq(q.field("isRead"), false),
        q.neq(q.field("senderId"), user._id)
      ))
      .take(100);
      
    for (const msg of msgs) {
       await ctx.db.patch(msg._id, { isRead: true });
    }
  },
});

export const getUserConversations = query({
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

    let conversations: Doc<"conversations">[] = [];

    // Fetch conversations dependent on role
    if (user.role === "viewer") {
       conversations = await ctx.db
         .query("conversations")
         .withIndex("by_viewer", (q: any) => q.eq("viewerId", user._id))
         .collect();
    } else if (user.role === "owner") {
       conversations = await ctx.db
         .query("conversations")
         .withIndex("by_owner", (q: any) => q.eq("ownerId", user._id))
         .collect();
    }

    // Resolve property and peer references
    // Peer = owner if role is viewer, viewer if role is owner
    const hydrated = await Promise.all(
       conversations.map(async (conv: any) => {
          if (user.role === "viewer" && conv.viewerDeleted) return null;
          if (user.role === "owner" && conv.ownerDeleted) return null;

          const property: any = await ctx.db.get(conv.propertyId);
          if (!property) return null;
          
          let prices = [0];
          if (property.rooms && property.rooms.length > 0) {
            prices = property.rooms.map((r: any) => r.price);
          }
          const priceMin = Math.min(...prices);

          const peerId = user.role === "viewer" ? conv.ownerId : conv.viewerId;
          const peer = await ctx.db.get(peerId);

          let imageUrl = undefined;
          if (property.images && property.images.length > 0 && property.images[0]) {
             imageUrl = await ctx.storage.getUrl(property.images[0]);
          }

          let lastMessageText = "";
          let lastMessageTime = conv.updatedAt;

          if (conv.lastMessageId) {
             const lastMsg = await ctx.db.get(conv.lastMessageId);
             if (lastMsg) {
               lastMessageText = (lastMsg as any)?.text || "No messages yet";
               lastMessageTime = lastMsg._creationTime;
             }
          }

          const cutoff = user.role === "viewer" ? conv.viewerMessagesCutoff : conv.ownerMessagesCutoff;
          
          // Count overall unread
          // RES-H05: Bound unread count query
          let unreadMsgs = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q: any) => q.eq("conversationId", conv._id))
            .filter((q: any) => q.and(q.eq(q.field("isRead"), false), q.neq(q.field("senderId"), user._id)))
            .take(100);

          if (cutoff) {
             unreadMsgs = unreadMsgs.filter((m: any) => m._creationTime >= cutoff);
          }

          return {
             id: conv._id,
             property: {
                id: property._id,
                name: property.name,
                address: property.location.address,
                priceMin,
                image: imageUrl,
                isVisible: property.isVisible ?? true,
                status: property.status || "Active",
             },
             peer: {
                id: peerId,
                name: (peer as any)?.name || (user.role === "viewer" ? "Property Owner" : "Viewer"),
                image: (peer as any)?.image,
             },
             lastMessageText,
             lastMessageTime,
             updatedAt: conv.updatedAt,
             unreadCount: unreadMsgs.length,
          };
       })
    );

    return hydrated.filter(Boolean).sort((a: any, b: any) => (b!.updatedAt - a!.updatedAt));
  },
});
