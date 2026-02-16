import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── USERS ──────────────────────────────────────────────────────────
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    role: v.union(v.literal("candidate"), v.literal("interviewer")),
    clerkId: v.string(),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    github: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    xp: v.optional(v.number()),
    level: v.optional(v.number()),
    streak: v.optional(v.number()),
    lastActiveDate: v.optional(v.string()),
    questionsCompleted: v.optional(v.number()),
    interviewsAttended: v.optional(v.number()),
    badges: v.optional(v.array(v.string())),
    isOnline: v.optional(v.boolean()),
  }).index("by_clerk_id", ["clerkId"]),

  // ─── INTERVIEWS ─────────────────────────────────────────────────────
  interviews: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  })
    .index("by_candidate_id", ["candidateId"])
    .index("by_stream_call_id", ["streamCallId"]),

  // ─── COMMENTS ───────────────────────────────────────────────────────
  comments: defineTable({
    content: v.string(),
    rating: v.number(),
    interviewerId: v.string(),
    interviewId: v.id("interviews"),
  }).index("by_interview_id", ["interviewId"]),

  // ─── QUESTIONS ──────────────────────────────────────────────────────
  questions: defineTable({
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
    createdBy: v.optional(v.string()),
  })
    .index("by_difficulty", ["difficulty"])
    .index("by_category", ["category"]),

  // ─── SPACES (Discord servers / Quora spaces) ───────────────────────
  spaces: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    category: v.string(),
    ownerId: v.string(),
    memberIds: v.array(v.string()),
    isPublic: v.boolean(),
    tags: v.optional(v.array(v.string())),
    memberCount: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_category", ["category"]),

  // ─── CHANNELS (within spaces) ──────────────────────────────────────
  channels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    spaceId: v.id("spaces"),
    type: v.union(v.literal("text"), v.literal("voice"), v.literal("announcements")),
    createdBy: v.string(),
  }).index("by_space", ["spaceId"]),

  // ─── MESSAGES (real-time chat in channels & DMs) ───────────────────
  messages: defineTable({
    content: v.string(),
    senderId: v.string(),
    senderName: v.string(),
    senderImage: v.optional(v.string()),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.string()),
    meetingId: v.optional(v.string()),
    type: v.union(v.literal("channel"), v.literal("dm"), v.literal("meeting")),
    isEdited: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
    replyToId: v.optional(v.id("messages")),
    attachmentUrl: v.optional(v.string()),
    codeSnippet: v.optional(
      v.object({
        language: v.string(),
        code: v.string(),
      })
    ),
    reactions: v.optional(
      v.array(
        v.object({
          emoji: v.string(),
          userId: v.string(),
          userName: v.string(),
        })
      )
    ),
  })
    .index("by_channel", ["channelId"])
    .index("by_conversation", ["conversationId"])
    .index("by_meeting", ["meetingId"]),

  // ─── CONVERSATIONS (DM threads) ────────────────────────────────────
  conversations: defineTable({
    participantIds: v.array(v.string()),
    lastMessageTime: v.optional(v.number()),
    lastMessagePreview: v.optional(v.string()),
  }),

  // ─── POSTS (Twitter/Quora-like discussion feed) ────────────────────
  posts: defineTable({
    content: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    authorImage: v.optional(v.string()),
    spaceId: v.optional(v.id("spaces")),
    tags: v.optional(v.array(v.string())),
    codeSnippet: v.optional(
      v.object({
        language: v.string(),
        code: v.string(),
      })
    ),
    likeCount: v.number(),
    commentCount: v.number(),
    likedBy: v.array(v.string()),
    isPinned: v.optional(v.boolean()),
  })
    .index("by_author", ["authorId"])
    .index("by_space", ["spaceId"]),

  // ─── POST COMMENTS ─────────────────────────────────────────────────
  postComments: defineTable({
    content: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    authorImage: v.optional(v.string()),
    postId: v.id("posts"),
    parentCommentId: v.optional(v.id("postComments")),
    likeCount: v.number(),
    likedBy: v.array(v.string()),
  }).index("by_post", ["postId"]),

  // ─── NOTIFICATIONS ─────────────────────────────────────────────────
  notifications: defineTable({
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
    isRead: v.boolean(),
    fromUserId: v.optional(v.string()),
    fromUserName: v.optional(v.string()),
    fromUserImage: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // ─── CODE SUBMISSIONS (track coding history) ───────────────────────
  codeSubmissions: defineTable({
    userId: v.string(),
    questionId: v.id("questions"),
    questionTitle: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.string(),
    status: v.union(v.literal("success"), v.literal("error"), v.literal("running")),
    executionTime: v.optional(v.number()),
    interviewId: v.optional(v.id("interviews")),
  })
    .index("by_user", ["userId"])
    .index("by_question", ["questionId"]),

  // ─── TYPING INDICATORS (ephemeral real-time) ───────────────────────
  typingIndicators: defineTable({
    userId: v.string(),
    userName: v.string(),
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.string()),
    meetingId: v.optional(v.string()),
    expiresAt: v.number(),
  })
    .index("by_channel", ["channelId"])
    .index("by_conversation", ["conversationId"])
    .index("by_meeting", ["meetingId"]),

  // ─── STATUS UPDATES (Instagram-like stories) ──────────────────────
  statusUpdates: defineTable({
    userId: v.string(),
    userName: v.string(),
    userImage: v.optional(v.string()),
    content: v.string(),
    emoji: v.optional(v.string()),
    expiresAt: v.number(),
  }).index("by_user", ["userId"]),

  // ─── REELS (VidSnap AI – slideshow reels from images + narration) ─
  reels: defineTable({
    title: v.string(),
    description: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    authorImage: v.optional(v.string()),
    imageUrls: v.array(v.string()),
    storageId: v.optional(v.id("_storage")),
    videoUrl: v.optional(v.string()),
    status: v.union(
      v.literal("processing"),
      v.literal("ready"),
      v.literal("failed")
    ),
    duration: v.optional(v.number()),
    likeCount: v.number(),
    likedBy: v.array(v.string()),
    viewCount: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_status", ["status"]),
})