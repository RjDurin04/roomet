import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

// Helper to get the authenticated user's profile
async function getAuthenticatedProfile(ctx: any) {
  const authUser = await authComponent.getAuthUser(ctx);
  if (!authUser) {
    throw new Error("Not authenticated");
  }

  const profile = await ctx.db
    .query("users")
    .withIndex("by_authUserId", (q: any) => q.eq("authUserId", authUser._id))
    .unique();

  if (!profile) {
    throw new Error("User profile not found");
  }

  return profile;
}

function validatePropertyInput(args: any) {
  if (!args.name.trim() || args.name.length > 200) {
    throw new Error("Property name must be 1-200 chars");
  }
  if (args.description.length > 5000) {
    throw new Error("Description max 5000 characters");
  }
  if (!args.rooms || args.rooms.length === 0 || args.rooms.length > 50) {
    throw new Error("Must have 1-50 rooms");
  }
  for (const room of args.rooms) {
    if (!Number.isInteger(room.price) || room.price <= 0) {
      throw new Error("Room price must be a positive whole number (pesos)");
    }
    if (room.capacity < 1 || room.capacity > 100) {
      throw new Error("Room capacity must be 1-100");
    }
    if ((room.occupied || 0) > room.capacity) {
      throw new Error("Occupied cannot exceed capacity");
    }
    if ((room.name !== undefined) && !room.name.trim()) {
      throw new Error("Room name required");
    }
  }
  if (args.location.lat < -90 || args.location.lat > 90) {
    throw new Error("Invalid latitude");
  }
  if (args.location.lng < -180 || args.location.lng > 180) {
    throw new Error("Invalid longitude");
  }
}

export const create = mutation({
  args: {
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
    amenities: v.array(v.string()),
    rules: v.string(),
    images: v.array(v.string()),
    visitingSchedule: v.optional(v.string()),
    rooms: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        type: v.string(),
        gender: v.string(),
        capacity: v.number(),
        occupied: v.number(),
        price: v.number(),
        priceType: v.union(v.literal("person"), v.literal("room")),
        amenities: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const profile = await getAuthenticatedProfile(ctx);

    if (profile.role !== "owner") {
      throw new Error("Only owners can create properties");
    }

    validatePropertyInput(args);

    const { visitingSchedule, ...restArgs } = args;

    const propertyId = await ctx.db.insert("properties", {
      ...restArgs,
      ownerId: profile._id,
      status: "Active", // Default legacy status for new properties
      isVisible: true,
    });

    return propertyId;
  },
});

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const properties = await ctx.db
      .query("properties")
      .filter((q) => 
        q.or(
          q.eq(q.field("isVisible"), true),
          q.and(
            q.eq(q.field("isVisible"), undefined),
            q.eq(q.field("status"), "Active")
          )
        )
      )
      .collect();

    return Promise.all(
      properties.map(async (property) => {
        const imageUrls = await Promise.all(
          property.images.map(async (storageId) => {
            return await ctx.storage.getUrl(storageId);
          })
        );
        
        const reviews = await ctx.db
          .query("reviews")
          .withIndex("by_propertyId", (q) => q.eq("propertyId", property._id))
          .collect();
          
        let rating = 0;
        if (reviews.length > 0) {
          rating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        }
        rating = Number(rating.toFixed(1));

        return { ...property, imageUrls, rating, reviewsCount: reviews.length };
      })
    );
  },
});

export const listByOwner = query({
  args: {},
  handler: async (ctx) => {
    let authUser;
    try {
      authUser = await authComponent.getAuthUser(ctx);
    } catch (e: any) {
      if (e.message && e.message.includes("Unauthenticated")) {
        return [];
      }
      throw e;
    }
    
    if (!authUser) return [];

    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", authUser._id))
      .unique();

    if (!profile) return [];

    const properties = await ctx.db
      .query("properties")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", profile._id))
      .collect();

    // Map storage IDs to actual URLs
    return Promise.all(
      properties.map(async (property) => {
        const imageUrls = await Promise.all(
          property.images.map(async (storageId) => {
            return await ctx.storage.getUrl(storageId);
          })
        );
        return { ...property, imageUrls };
      })
    );
  },
});

export const toggleVisibility = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const profile = await getAuthenticatedProfile(ctx);
    const property = await ctx.db.get(args.id);

    if (!property) {
      throw new Error("Property not found");
    }

    if (property.ownerId !== profile._id) {
      throw new Error("Unauthorized to modify this property");
    }

    // Default to true if undefined, since legacy properties might not have isVisible
    const currentVisibility = property.isVisible ?? (property.status === "Active");
    const newVisibility = !currentVisibility;
    
    await ctx.db.patch(args.id, { 
      isVisible: newVisibility,
      status: newVisibility ? "Active" : "Inactive"
    });
    
    return newVisibility;
  },
});

export const remove = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const profile = await getAuthenticatedProfile(ctx);
    const property = await ctx.db.get(args.id);

    if (!property) {
      throw new Error("Property not found");
    }

    if (property.ownerId !== profile._id) {
      throw new Error("Unauthorized to delete this property");
    }

    // RES-H03b & DI-004: Soft delete property instead of unbounded cascade delete
    // DI-016 is also avoided by not performing unsafe loop storage cleanup
    await ctx.db.patch(args.id, { 
      status: "Deleted", 
      isVisible: false 
    });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  const profile = await getAuthenticatedProfile(ctx);
  if (profile.role !== "owner") {
    throw new Error("Only owners can upload property images");
  }
  return await ctx.storage.generateUploadUrl();
});

export const getById = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.id);
    if (!property) return null;

    const imageUrls = await Promise.all(
      property.images.map(async (storageId) => {
        return await ctx.storage.getUrl(storageId);
      })
    );
    
    return { ...property, imageUrls };
  },
});

export const update = mutation({
  args: {
    id: v.id("properties"),
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
    genderRestriction: v.union(v.literal("male"), v.literal("female"), v.literal("mixed")),
    amenities: v.array(v.string()),
    rules: v.string(),
    images: v.array(v.string()),
    visitingSchedule: v.optional(v.string()),
    rooms: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        type: v.string(),
        gender: v.string(),
        capacity: v.number(),
        occupied: v.number(),
        price: v.number(),
        priceType: v.union(v.literal("person"), v.literal("room")),
        amenities: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const profile = await getAuthenticatedProfile(ctx);
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Property not found");
    }

    if (existing.ownerId !== profile._id) {
      throw new Error("Unauthorized to update this property");
    }

    validatePropertyInput(args);

    const { id, visitingSchedule, ...updateFields } = args;

    await ctx.db.patch(id, updateFields);
  },
});
