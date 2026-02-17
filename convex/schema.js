import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  users: defineTable({
    // Basic user info from Clerk
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(), // Clerk user ID for auth
    imageUrl: v.optional(v.string()), // Profile picture

    // Subscription plan (managed by Clerk billing)
    plan: v.union(v.literal("free"), v.literal("pro")),

    // Usage tracking for plan limits
    projectsUsed: v.number(), // Current project count
    exportsThisMonth: v.number(), // Monthly export limit tracking

    // Activity timestamps
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"]) // Primary auth lookup
    .index("by_email", ["email"]) // Email lookups
    .searchIndex("search_name", { searchField: "name" }) // User search
    .searchIndex("search_email", { searchField: "email" }),
});
