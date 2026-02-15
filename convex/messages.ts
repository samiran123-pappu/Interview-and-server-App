import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Send a message ──────────────────────────────────────────────────
export const send = mutation({
  args: {
    content: v.string(),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.string()),
    meetingId: v.optional(v.string()),
    type: v.union(v.literal("channel"), v.literal("dm"), v.literal("meeting")),
    replyToId: v.optional(v.id("messages")),
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

    const msgId = await ctx.db.insert("messages", {
      ...args,
      senderId: identity.subject,
      senderName: user?.name || identity.name || "Anonymous",
      senderImage: user?.image || identity.pictureUrl,
    });

    // Update conversation last message if DM
    if (args.type === "dm" && args.conversationId) {
      const allConvos = await ctx.db.query("conversations").collect();
      const convo = allConvos.find((c) => {
        const sorted = [...c.participantIds].sort().join("-");
        return sorted === args.conversationId;
      });
      if (convo) {
        await ctx.db.patch(convo._id, {
          lastMessageTime: Date.now(),
          lastMessagePreview:
            args.content.length > 50
              ? args.content.slice(0, 50) + "..."
              : args.content,
        });
      }
    }

    return msgId;
  },
});

// ── Get messages for a channel ──────────────────────────────────────
export const getByChannel = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channelId", args.channelId))
      .collect();
  },
});

// ── Get messages for a DM conversation ──────────────────────────────
export const getByConversation = query({
  args: { conversationId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
  },
});

// ── Get messages for a meeting ──────────────────────────────────────
export const getByMeeting = query({
  args: { meetingId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId))
      .collect();
  },
});

// ── Edit a message ──────────────────────────────────────────────────
export const edit = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.senderId !== identity.subject) throw new Error("Cannot edit");

    await ctx.db.patch(args.messageId, {
      content: args.content,
      isEdited: true,
    });
  },
});

// ── Delete a message ────────────────────────────────────────────────
export const remove = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.senderId !== identity.subject) throw new Error("Cannot delete");

    // Soft delete — keep the record but blank the content
    await ctx.db.patch(args.messageId, {
      content: "This message was deleted",
      isDeleted: true,
      codeSnippet: undefined,
      reactions: undefined,
    });
  },
});

// ── Toggle reaction on a message ────────────────────────────────────
export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");

    const reactions = msg.reactions || [];
    const existingIdx = reactions.findIndex(
      (r) => r.emoji === args.emoji && r.userId === identity.subject
    );

    if (existingIdx >= 0) {
      reactions.splice(existingIdx, 1);
    } else {
      reactions.push({
        emoji: args.emoji,
        userId: identity.subject,
        userName: user?.name || identity.name || "User",
      });
    }

    await ctx.db.patch(args.messageId, { reactions });
  },
});

// ── Set typing indicator ────────────────────────────────────────────
export const setTyping = mutation({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.string()),
    meetingId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // Remove old typing indicators from this user for this context
    const allTyping = await ctx.db.query("typingIndicators").collect();
    for (const t of allTyping) {
      if (
        t.userId === identity.subject &&
        t.channelId === args.channelId &&
        t.conversationId === args.conversationId &&
        t.meetingId === args.meetingId
      ) {
        await ctx.db.delete(t._id);
      }
    }

    // Insert new typing indicator that expires in 3 seconds
    await ctx.db.insert("typingIndicators", {
      userId: identity.subject,
      userName: user?.name || identity.name || "User",
      channelId: args.channelId,
      conversationId: args.conversationId,
      meetingId: args.meetingId,
      expiresAt: Date.now() + 3000,
    });
  },
});

// ── Clear typing indicator ──────────────────────────────────────────
export const clearTyping = mutation({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.string()),
    meetingId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const allTyping = await ctx.db.query("typingIndicators").collect();
    for (const t of allTyping) {
      if (
        t.userId === identity.subject &&
        t.channelId === args.channelId &&
        t.conversationId === args.conversationId &&
        t.meetingId === args.meetingId
      ) {
        await ctx.db.delete(t._id);
      }
    }
  },
});

// ── Get typing indicators for a context ─────────────────────────────
export const getTypingUsers = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.string()),
    meetingId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const now = Date.now();
    let indicators;

    if (args.channelId) {
      indicators = await ctx.db
        .query("typingIndicators")
        .withIndex("by_channel", (q) => q.eq("channelId", args.channelId!))
        .collect();
    } else if (args.conversationId) {
      indicators = await ctx.db
        .query("typingIndicators")
        .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId!))
        .collect();
    } else if (args.meetingId) {
      indicators = await ctx.db
        .query("typingIndicators")
        .withIndex("by_meeting", (q) => q.eq("meetingId", args.meetingId!))
        .collect();
    } else {
      return [];
    }

    // Filter out expired and self
    return indicators
      .filter((t) => t.expiresAt > now && t.userId !== identity.subject)
      .map((t) => t.userName);
  },
});
