import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Get channels for a space ────────────────────────────────────────
export const getBySpace = query({
  args: { spaceId: v.id("spaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("channels")
      .withIndex("by_space", (q) => q.eq("spaceId", args.spaceId))
      .collect();
  },
});

// ── Create a channel ────────────────────────────────────────────────
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    spaceId: v.id("spaces"),
    type: v.union(v.literal("text"), v.literal("voice"), v.literal("announcements")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("channels", {
      ...args,
      createdBy: identity.subject,
    });
  },
});

// ── Delete a channel ────────────────────────────────────────────────
export const remove = mutation({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Delete all messages in the channel first
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    await ctx.db.delete(args.channelId);
  },
});
