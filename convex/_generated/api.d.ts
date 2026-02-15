/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as channels from "../channels.js";
import type * as codeSubmissions from "../codeSubmissions.js";
import type * as comments from "../comments.js";
import type * as conversations from "../conversations.js";
import type * as http from "../http.js";
import type * as interviews from "../interviews.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as posts from "../posts.js";
import type * as questions from "../questions.js";
import type * as spaces from "../spaces.js";
import type * as statusUpdates from "../statusUpdates.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  channels: typeof channels;
  codeSubmissions: typeof codeSubmissions;
  comments: typeof comments;
  conversations: typeof conversations;
  http: typeof http;
  interviews: typeof interviews;
  messages: typeof messages;
  notifications: typeof notifications;
  posts: typeof posts;
  questions: typeof questions;
  spaces: typeof spaces;
  statusUpdates: typeof statusUpdates;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
