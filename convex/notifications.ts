import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Get notifications for the current user ──────────────────────────
export const getMyNotifications = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// ── Get unread count ────────────────────────────────────────────────
export const getUnreadCount = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return notifications.filter((n) => !n.isRead).length;
  },
});

// ── Mark a notification as read ─────────────────────────────────────
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

// ── Mark all as read ────────────────────────────────────────────────
export const markAllAsRead = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    for (const notif of notifications) {
      if (!notif.isRead) {
        await ctx.db.patch(notif._id, { isRead: true });
      }
    }
  },
});

// ── Create a notification ───────────────────────────────────────────
export const create = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("interview_scheduled"),
      v.literal("interview_reminder"),
      v.literal("message"),
      v.literal("post_like"),
      v.literal("post_comment"),
      v.literal("space_invite"),
      v.literal("badge_earned"),
      v.literal("mention")
    ),
    title: v.string(),
    body: v.string(),
    linkUrl: v.optional(v.string()),
    fromUserId: v.optional(v.string()),
    fromUserName: v.optional(v.string()),
    fromUserImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
    });
  },
});

// ── Delete a notification ───────────────────────────────────────────
export const remove = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const notif = await ctx.db.get(args.notificationId);
    if (!notif || notif.userId !== identity.subject) throw new Error("Cannot delete");

    await ctx.db.delete(args.notificationId);
  },
});
