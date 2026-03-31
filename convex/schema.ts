import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // App-specific tables
  users: defineTable({
    // Linked to better-auth user by authUserId
    authUserId: v.string(),
    role: v.optional(v.union(v.literal("viewer"), v.literal("owner"))),
    onboardingComplete: v.optional(v.boolean()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  })
    .index("by_authUserId", ["authUserId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("new_message"),
      v.literal("new_review"),
      v.literal("review_reply")
    ),
    title: v.string(),
    body: v.string(),
    link: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isRead", ["userId", "isRead"]),

  reviews: defineTable({
    propertyId: v.id("properties"),
    userId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    reply: v.optional(v.string()),
    status: v.optional(v.union(v.literal("Published"), v.literal("Reported"))),
    createdAt: v.number(),
    userName: v.string(),
    userImage: v.optional(v.string()),
  })
    .index("by_propertyId", ["propertyId"])
    .index("by_property_user", ["propertyId", "userId"]),

  bookmarks: defineTable({
    userId: v.id("users"),
    propertyId: v.id("properties"),
  })
    .index("by_userId", ["userId"])
    .index("by_propertyId", ["propertyId"])
    .index("by_user_property", ["userId", "propertyId"]),

  properties: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    description: v.string(),
    contact: v.object({
      phone: v.string(),
      email: v.string(),
    }),
    location: v.object({
      address: v.string(),
      lat: v.number(),
      lng: v.number(),
    }),
    genderRestriction: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("mixed"))),
    amenities: v.array(v.string()),
    rules: v.string(),
    images: v.array(v.string()), // Array of storage IDs
    status: v.optional(v.union(v.literal("Active"), v.literal("Pending"), v.literal("Inactive"), v.literal("Deleted"))),
    isVisible: v.optional(v.boolean()),
    visitingSchedule: v.optional(v.string()),
        rooms: v.array(
          v.object({
            id: v.string(), // Client-side generated ID for React keys
            name: v.optional(v.string()),
            type: v.string(),
            gender: v.optional(v.string()),
            capacity: v.number(),
            occupied: v.optional(v.number()),
            price: v.number(),
            priceType: v.union(v.literal("person"), v.literal("room")),
            amenities: v.array(v.string()),
          })
        ),
  })
    .index("by_ownerId", ["ownerId"])
    .index("by_status", ["status"]),

  conversations: defineTable({
    propertyId: v.id("properties"),
    viewerId: v.id("users"),
    ownerId: v.id("users"),
    status: v.optional(v.union(v.literal("active"), v.literal("archived"))),
    lastMessageId: v.optional(v.id("messages")),
    updatedAt: v.number(),
    
    // Soft deletion flags & cutoffs
    viewerDeleted: v.optional(v.boolean()),
    ownerDeleted: v.optional(v.boolean()),
    viewerMessagesCutoff: v.optional(v.number()),
    ownerMessagesCutoff: v.optional(v.number()),
  })
    .index("by_viewer", ["viewerId"])
    .index("by_owner", ["ownerId"])
    .index("by_property", ["propertyId"])
    .index("by_viewer_property", ["viewerId", "propertyId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    text: v.optional(v.string()),
    image: v.optional(v.id("_storage")),
    images: v.optional(v.array(v.id("_storage"))),
    isRead: v.boolean(),
    createdAt: v.optional(v.number()),
  })
    .index("by_conversation", ["conversationId"]),
});
