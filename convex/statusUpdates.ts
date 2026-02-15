import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Set a status update (Instagram-like story, lasts 24h) ───────────
export const setStatus = mutation({
  args: {
    content: v.string(),
    emoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // Remove existing status from this user
    const existing = await ctx.db
      .query("statusUpdates")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    for (const s of existing) {
      await ctx.db.delete(s._id);
    }

    return await ctx.db.insert("statusUpdates", {
      userId: identity.subject,
      userName: user?.name || identity.name || "User",
      userImage: user?.image || identity.pictureUrl,
      content: args.content,
      emoji: args.emoji,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
  },
});

// ── Clear status ────────────────────────────────────────────────────
export const clearStatus = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const existing = await ctx.db
      .query("statusUpdates")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    for (const s of existing) {
      await ctx.db.delete(s._id);
    }
  },
});

// ── Get all active statuses ─────────────────────────────────────────
export const getActiveStatuses = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const now = Date.now();
    const all = await ctx.db.query("statusUpdates").collect();
    return all.filter((s) => s.expiresAt > now);
  },
});

// ── Get a specific user's status ────────────────────────────────────
export const getUserStatus = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const statuses = await ctx.db
      .query("statusUpdates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return statuses.find((s) => s.expiresAt > now) || null;
  },
});
