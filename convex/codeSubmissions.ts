import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Submit code ─────────────────────────────────────────────────────
export const submit = mutation({
  args: {
    questionId: v.id("questions"),
    questionTitle: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.string(),
    status: v.union(v.literal("success"), v.literal("error"), v.literal("running")),
    executionTime: v.optional(v.number()),
    interviewId: v.optional(v.id("interviews")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const submissionId = await ctx.db.insert("codeSubmissions", {
      ...args,
      userId: identity.subject,
    });

    // Update user XP & stats
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (user && args.status === "success") {
      const currentXp = user.xp || 0;
      const questionsCompleted = (user.questionsCompleted || 0) + 1;
      const newXp = currentXp + 10;
      const newLevel = Math.floor(newXp / 100) + 1;

      // Calculate streak
      const today = new Date().toISOString().split("T")[0];
      const lastActive = user.lastActiveDate;
      let streak = user.streak || 0;

      if (lastActive !== today) {
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split("T")[0];
        streak = lastActive === yesterday ? streak + 1 : 1;
      }

      // Check for new badges
      const badges = user.badges || [];
      if (questionsCompleted >= 1 && !badges.includes("first_solve"))
        badges.push("first_solve");
      if (questionsCompleted >= 10 && !badges.includes("ten_solves"))
        badges.push("ten_solves");
      if (questionsCompleted >= 50 && !badges.includes("fifty_solves"))
        badges.push("fifty_solves");
      if (questionsCompleted >= 100 && !badges.includes("hundred_solves"))
        badges.push("hundred_solves");
      if (streak >= 7 && !badges.includes("week_streak"))
        badges.push("week_streak");
      if (streak >= 30 && !badges.includes("month_streak"))
        badges.push("month_streak");
      if (newLevel >= 5 && !badges.includes("level_5"))
        badges.push("level_5");
      if (newLevel >= 10 && !badges.includes("level_10"))
        badges.push("level_10");

      await ctx.db.patch(user._id, {
        xp: newXp,
        level: newLevel,
        questionsCompleted,
        streak,
        lastActiveDate: today,
        badges,
      });
    }

    return submissionId;
  },
});

// ── Get submissions by user ─────────────────────────────────────────
export const getByUser = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = args.userId || identity.subject;
    return await ctx.db
      .query("codeSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ── Get submissions by question ─────────────────────────────────────
export const getByQuestion = query({
  args: { questionId: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("codeSubmissions")
      .withIndex("by_question", (q) => q.eq("questionId", args.questionId))
      .order("desc")
      .collect();
  },
});

// ── Get leaderboard ─────────────────────────────────────────────────
export const getLeaderboard = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .map((u) => ({
        clerkId: u.clerkId,
        name: u.name,
        image: u.image,
        xp: u.xp || 0,
        level: u.level || 1,
        questionsCompleted: u.questionsCompleted || 0,
        streak: u.streak || 0,
        badges: u.badges || [],
      }))
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 50);
  },
});
