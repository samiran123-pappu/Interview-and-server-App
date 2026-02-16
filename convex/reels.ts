import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Generate an upload URL for reel video ───────────────────────────
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});

// ── Create a reel ───────────────────────────────────────────────────
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    imageUrls: v.array(v.string()),
    storageId: v.optional(v.id("_storage")),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    let videoUrl: string | undefined;
    if (args.storageId) {
      try {
        videoUrl = (await ctx.storage.getUrl(args.storageId)) ?? undefined;
      } catch (e) {
        console.warn("Could not get storage URL:", e);
      }
    }

    return await ctx.db.insert("reels", {
      title: args.title,
      description: args.description,
      authorId: identity.subject,
      authorName: user?.name || identity.name || "Anonymous",
      authorImage: user?.image || identity.pictureUrl,
      imageUrls: args.imageUrls,
      storageId: args.storageId,
      videoUrl,
      status: args.storageId ? "ready" : "processing",
      duration: args.duration,
      likeCount: 0,
      likedBy: [],
      viewCount: 0,
    });
  },
});

// ── Mark reel as ready (after client-side processing) ───────────────
export const markReady = mutation({
  args: {
    reelId: v.id("reels"),
    storageId: v.id("_storage"),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const reel = await ctx.db.get(args.reelId);
    if (!reel) throw new Error("Reel not found");
    if (reel.authorId !== identity.subject) throw new Error("Unauthorized");

    const videoUrl = (await ctx.storage.getUrl(args.storageId)) ?? undefined;

    await ctx.db.patch(args.reelId, {
      storageId: args.storageId,
      videoUrl,
      status: "ready",
      duration: args.duration,
    });
  },
});

// ── Get all reels (gallery feed) ────────────────────────────────────
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("reels").order("desc").collect();
  },
});

// ── Get reels by user ───────────────────────────────────────────────
export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reels")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .order("desc")
      .collect();
  },
});

// ── Like / unlike a reel ────────────────────────────────────────────
export const toggleLike = mutation({
  args: { reelId: v.id("reels") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const reel = await ctx.db.get(args.reelId);
    if (!reel) throw new Error("Reel not found");

    const isLiked = reel.likedBy.includes(identity.subject);

    await ctx.db.patch(args.reelId, {
      likedBy: isLiked
        ? reel.likedBy.filter((id) => id !== identity.subject)
        : [...reel.likedBy, identity.subject],
      likeCount: isLiked ? reel.likeCount - 1 : reel.likeCount + 1,
    });
  },
});

// ── Increment view count ────────────────────────────────────────────
export const incrementView = mutation({
  args: { reelId: v.id("reels") },
  handler: async (ctx, args) => {
    const reel = await ctx.db.get(args.reelId);
    if (!reel) return;
    await ctx.db.patch(args.reelId, {
      viewCount: reel.viewCount + 1,
    });
  },
});

// ── Delete a reel ───────────────────────────────────────────────────
export const remove = mutation({
  args: { reelId: v.id("reels") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const reel = await ctx.db.get(args.reelId);
    if (!reel) throw new Error("Reel not found");
    if (reel.authorId !== identity.subject) throw new Error("Unauthorized");

    if (reel.storageId) {
      await ctx.storage.delete(reel.storageId);
    }

    await ctx.db.delete(args.reelId);
  },
});
