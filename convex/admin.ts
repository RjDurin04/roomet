import { mutation, type MutationCtx } from "./_generated/server";
import { authComponent } from "./auth";

// Data repair mutation to fix schema violations (nulls where numbers are expected)
// RES-H03: Ensures data integrity for properties and rooms
export const repairData = mutation({
  args: {},
  handler: async (ctx: MutationCtx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Not authenticated");
    
    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q: any) => q.eq("authUserId", authUser._id))
      .unique();
      
    if (!profile || profile.role !== "owner") {
      throw new Error("Only owners can repair their data or add a superuser check");
    }

    const properties = await ctx.db.query("properties").collect();
    let fixedCount = 0;

    for (const property of properties) {
      let needsFix = false;
      const patch: any = {};

      // Fix location
      if (typeof property.location.lat !== 'number' || typeof property.location.lng !== 'number') {
        patch.location = {
          ...property.location,
          lat: typeof property.location.lat === 'number' ? property.location.lat : 10.3157, // Cebu fallback
          lng: typeof property.location.lng === 'number' ? property.location.lng : 123.891,
        };
        needsFix = true;
      }

      // Fix rooms
      if (property.rooms && Array.isArray(property.rooms)) {
        const fixedRooms = property.rooms.map((room: any) => {
          let roomNeedsFix = false;
          const newRoom = { ...room };
          
          if (typeof room.price !== 'number' || isNaN(room.price)) {
            newRoom.price = 0;
            roomNeedsFix = true;
          }
          if (typeof room.capacity !== 'number' || isNaN(room.capacity)) {
            newRoom.capacity = 1;
            roomNeedsFix = true;
          }
          if (room.occupied === null) {
            newRoom.occupied = 0;
            roomNeedsFix = true;
          }
          
          if (roomNeedsFix) needsFix = true;
          return newRoom;
        });

        if (needsFix) {
          patch.rooms = fixedRooms;
        }
      }

      if (needsFix) {
        await ctx.db.patch(property._id, patch);
        fixedCount++;
      }
    }

    return { total: properties.length, fixed: fixedCount };
  },
});
