import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Create a new space ───────────────────────────────────────────────
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    icon: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const spaceId = await ctx.db.insert("spaces", {
      ...args,
      ownerId: identity.subject,
      memberIds: [identity.subject],
      memberCount: 1,
    });

    // Create default channels
    await ctx.db.insert("channels", {
      name: "general",
      description: "General discussion",
      spaceId,
      type: "text",
      createdBy: identity.subject,
    });

    await ctx.db.insert("channels", {
      name: "announcements",
      description: "Important announcements",
      spaceId,
      type: "announcements",
      createdBy: identity.subject,
    });

    return spaceId;
  },
});

// ── Get all public spaces ────────────────────────────────────────────
export const getPublicSpaces = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("spaces")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();
  },
});

// ── Get spaces the user is a member of ───────────────────────────────
export const getMySpaces = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const allSpaces = await ctx.db.query("spaces").collect();
    return allSpaces.filter((s) => s.memberIds.includes(identity.subject));
  },
});

// ── Get a space by ID ────────────────────────────────────────────────
export const getById = query({
  args: { spaceId: v.id("spaces") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.spaceId);
  },
});

// ── Join a space ─────────────────────────────────────────────────────
export const join = mutation({
  args: { spaceId: v.id("spaces") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const space = await ctx.db.get(args.spaceId);
    if (!space) throw new Error("Space not found");

    if (space.memberIds.includes(identity.subject)) return;

    await ctx.db.patch(args.spaceId, {
      memberIds: [...space.memberIds, identity.subject],
      memberCount: space.memberCount + 1,
    });
  },
});

// ── Leave a space ────────────────────────────────────────────────────
export const leave = mutation({
  args: { spaceId: v.id("spaces") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const space = await ctx.db.get(args.spaceId);
    if (!space) throw new Error("Space not found");

    if (space.ownerId === identity.subject) throw new Error("Owner cannot leave");

    await ctx.db.patch(args.spaceId, {
      memberIds: space.memberIds.filter((id) => id !== identity.subject),
      memberCount: Math.max(0, space.memberCount - 1),
    });
  },
});

// ── Get spaces by category ──────────────────────────────────────────
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("spaces")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});
