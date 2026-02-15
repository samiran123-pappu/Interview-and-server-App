import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Create a post ───────────────────────────────────────────────────
export const create = mutation({
  args: {
    content: v.string(),
    spaceId: v.optional(v.id("spaces")),
    tags: v.optional(v.array(v.string())),
    codeSnippet: v.optional(
      v.object({
        language: v.string(),
        code: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return await ctx.db.insert("posts", {
      ...args,
      authorId: identity.subject,
      authorName: user?.name || identity.name || "Anonymous",
      authorImage: user?.image || identity.pictureUrl,
      likeCount: 0,
      commentCount: 0,
      likedBy: [],
    });
  },
});

// ── Get all posts (feed) ────────────────────────────────────────────
export const getFeed = query({
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").collect();
    return posts;
  },
});

// ── Get posts by space ──────────────────────────────────────────────
export const getBySpace = query({
  args: { spaceId: v.id("spaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_space", (q) => q.eq("spaceId", args.spaceId))
      .order("desc")
      .collect();
  },
});

// ── Get posts by user ───────────────────────────────────────────────
export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.userId))
      .order("desc")
      .collect();
  },
});

// ── Like / unlike a post ────────────────────────────────────────────
export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const isLiked = post.likedBy.includes(identity.subject);

    if (isLiked) {
      await ctx.db.patch(args.postId, {
        likedBy: post.likedBy.filter((id) => id !== identity.subject),
        likeCount: Math.max(0, post.likeCount - 1),
      });
    } else {
      await ctx.db.patch(args.postId, {
        likedBy: [...post.likedBy, identity.subject],
        likeCount: post.likeCount + 1,
      });

      // Create notification for the author
      if (post.authorId !== identity.subject) {
        const user = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
          .first();

        await ctx.db.insert("notifications", {
          userId: post.authorId,
          type: "post_like",
          title: "New like on your post",
          body: `${user?.name || "Someone"} liked your post`,
          isRead: false,
          fromUserId: identity.subject,
          fromUserName: user?.name,
          fromUserImage: user?.image,
          linkUrl: "/feed",
        });
      }
    }
  },
});

// ── Delete a post ───────────────────────────────────────────────────
export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const post = await ctx.db.get(args.postId);
    if (!post || post.authorId !== identity.subject) throw new Error("Cannot delete");

    // Remove associated comments
    const comments = await ctx.db
      .query("postComments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    await ctx.db.delete(args.postId);
  },
});

// ── Add a comment to a post ─────────────────────────────────────────
export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    parentCommentId: v.optional(v.id("postComments")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    await ctx.db.insert("postComments", {
      content: args.content,
      authorId: identity.subject,
      authorName: user?.name || "Anonymous",
      authorImage: user?.image,
      postId: args.postId,
      parentCommentId: args.parentCommentId,
      likeCount: 0,
      likedBy: [],
    });

    // Increment comment count
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        commentCount: post.commentCount + 1,
      });

      // Notify post author
      if (post.authorId !== identity.subject) {
        await ctx.db.insert("notifications", {
          userId: post.authorId,
          type: "post_comment",
          title: "New comment on your post",
          body: `${user?.name || "Someone"} commented: "${args.content.slice(0, 40)}..."`,
          isRead: false,
          fromUserId: identity.subject,
          fromUserName: user?.name,
          fromUserImage: user?.image,
          linkUrl: "/feed",
        });
      }
    }
  },
});

// ── Get comments for a post ─────────────────────────────────────────
export const getCommentsByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("postComments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
  },
});
