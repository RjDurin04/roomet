import { query } from "./_generated/server";
import { authComponent } from "./auth";

export const testUser = query({
  args: {},
  handler: async (ctx: any) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) return "No auth user";
    
    // Test if we can find them
    const profile = await ctx.db
      .query("users")
      .withIndex("by_authUserId", (q: any) => q.eq("authUserId", authUser._id))
      .unique();
      
    // Return all profiles to check manually
    const allProfiles = await ctx.db.query("users").collect();
    
    return {
      authUserId_from_authUser: authUser._id,
      authUserId_type: typeof authUser._id,
      profile_found: !!profile,
      allProfiles: allProfiles.map((p: any) => ({
        id: p._id,
        authUserId: p.authUserId,
        authUserId_type: typeof p.authUserId
      }))
    };
  },
});
