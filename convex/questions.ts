import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all questions
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("questions").collect();
  },
});

// Get questions by difficulty
export const getByDifficulty = query({
  args: { difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty))
      .collect();
  },
});

// Get questions by category
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questions")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Get a single question by ID
export const getById = query({
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new question (interviewer only)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    category: v.string(),
    examples: v.array(
      v.object({
        input: v.string(),
        output: v.string(),
        explanation: v.optional(v.string()),
      })
    ),
    constraints: v.optional(v.array(v.string())),
    starterCode: v.object({
      javascript: v.string(),
      python: v.string(),
      java: v.string(),
      cpp: v.string(),
      typescript: v.string(),
      go: v.string(),
    }),
    hints: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("questions", {
      ...args,
      createdBy: identity.subject,
    });
  },
});

// Seed questions (no auth required, for initial data population)
export const seed = mutation({
  args: {
    questions: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
        category: v.string(),
        examples: v.array(
          v.object({
            input: v.string(),
            output: v.string(),
            explanation: v.optional(v.string()),
          })
        ),
        constraints: v.optional(v.array(v.string())),
        starterCode: v.object({
          javascript: v.string(),
          python: v.string(),
          java: v.string(),
          cpp: v.string(),
          typescript: v.string(),
          go: v.string(),
        }),
        hints: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Check if questions already exist
    const existing = await ctx.db.query("questions").first();
    if (existing) return { inserted: 0, message: "Questions already seeded" };

    let count = 0;
    for (const q of args.questions) {
      await ctx.db.insert("questions", q);
      count++;
    }
    return { inserted: count, message: `Seeded ${count} questions` };
  },
});

// Delete a question (interviewer only)
export const remove = mutation({
  args: { id: v.id("questions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

// Update a question (interviewer only)
export const update = mutation({
  args: {
    id: v.id("questions"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    category: v.optional(v.string()),
    examples: v.optional(
      v.array(
        v.object({
          input: v.string(),
          output: v.string(),
          explanation: v.optional(v.string()),
        })
      )
    ),
    constraints: v.optional(v.array(v.string())),
    starterCode: v.optional(
      v.object({
        javascript: v.string(),
        python: v.string(),
        java: v.string(),
        cpp: v.string(),
        typescript: v.string(),
        go: v.string(),
      })
    ),
    hints: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { id, ...fields } = args;
    // Filter out undefined fields
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }

    return await ctx.db.patch(id, updates);
  },
});
