import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Get or create a DM conversation ─────────────────────────────────
export const getOrCreate = mutation({
  args: { otherUserId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const participantIds = [identity.subject, args.otherUserId].sort();
    const conversationId = participantIds.join("-");

    // Check if conversation exists
    const allConvos = await ctx.db.query("conversations").collect();
    const existing = allConvos.find((c) => {
      const sorted = [...c.participantIds].sort().join("-");
      return sorted === conversationId;
    });

    if (existing) return { conversationId, convoId: existing._id };

    const convoId = await ctx.db.insert("conversations", {
      participantIds,
      lastMessageTime: Date.now(),
    });

    return { conversationId, convoId };
  },
});

// ── Get all conversations for the current user ──────────────────────
export const getMyConversations = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const allConvos = await ctx.db.query("conversations").collect();
    return allConvos.filter((c) =>
      c.participantIds.includes(identity.subject)
    );
  },
});
