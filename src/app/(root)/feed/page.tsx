"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HeartIcon,
  MessageCircleIcon,
  PlusIcon,
  CodeIcon,
  SendIcon,
  Loader2Icon,
  SparklesIcon,
  TrendingUpIcon,
  Trash2Icon,
  BookmarkIcon,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Id } from "../../../../convex/_generated/dataModel";

const POPULAR_TAGS = [
  "All",
  "javascript",
  "python",
  "react",
  "nextjs",
  "typescript",
  "algorithms",
  "career",
  "tips",
  "interview",
  "system-design",
];

function FeedPage() {
  const { user: clerkUser } = useUser();
  const posts = useQuery(api.posts.getFeed);
  const createPost = useMutation(api.posts.create);
  const toggleLike = useMutation(api.posts.toggleLike);
  const addComment = useMutation(api.posts.addComment);
  const removePost = useMutation(api.posts.remove);

  const [showCreate, setShowCreate] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [codeContent, setCodeContent] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const filteredPosts = (posts ?? []).filter(
    (p) =>
      activeTag === "All" ||
      p.tags?.some((t) => t.toLowerCase() === activeTag.toLowerCase())
  );

  const handleCreatePost = async () => {
    if (!newContent.trim()) {
      toast.error("Write something!");
      return;
    }
    try {
      await createPost({
        content: newContent,
        tags: newTags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        codeSnippet: codeContent
          ? { language: codeLanguage, code: codeContent }
          : undefined,
      });
      toast.success("Posted!");
      setShowCreate(false);
      setNewContent("");
      setNewTags("");
      setCodeContent("");
      setShowCodeSnippet(false);
    } catch {
      toast.error("Failed to post");
    }
  };

  const handleAddComment = async (postId: Id<"posts">) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    try {
      await addComment({ postId, content });
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch {
      toast.error("Failed to comment");
    }
  };

  if (posts === undefined) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Feed
          </h1>
          <p className="text-muted-foreground mt-1">
            Share ideas, code snippets, and learn from the community
          </p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-linear-to-r from-orange-500 to-pink-500 text-white">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <textarea
                className="w-full h-28 bg-muted/40 rounded-md p-3 text-sm resize-none border focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="What's on your mind? Share a thought, a tip, or ask a question..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />

              {showCodeSnippet && (
                <div className="border rounded-md overflow-hidden">
                  <div className="flex items-center gap-2 px-2 py-1 bg-muted/30 border-b">
                    <CodeIcon className="h-3 w-3 text-muted-foreground" />
                    <select
                      className="text-xs bg-transparent outline-none"
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                    >
                      {["javascript", "python", "java", "cpp", "typescript", "go", "rust", "ruby", "sql"].map(
                        (lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        )
                      )}
                    </select>
                    <button
                      className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setShowCodeSnippet(false);
                        setCodeContent("");
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    className="w-full h-28 p-2 text-xs font-mono bg-zinc-950 text-zinc-200 resize-none outline-none"
                    placeholder="Paste your code here..."
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCodeSnippet(!showCodeSnippet)}
                >
                  <CodeIcon className="h-3.5 w-3.5 mr-1" />
                  {showCodeSnippet ? "Remove Code" : "Add Code"}
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Tags: react, tips, career..."
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <Button onClick={handleCreatePost} className="w-full">
                <SparklesIcon className="h-4 w-4 mr-2" />
                Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tag Filters */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {POPULAR_TAGS.map((tag) => (
            <Button
              key={tag}
              variant={activeTag === tag ? "default" : "outline"}
              size="sm"
              className="text-xs shrink-0"
              onClick={() => setActiveTag(tag)}
            >
              {tag === "All" ? (
                <TrendingUpIcon className="h-3 w-3 mr-1" />
              ) : (
                "#"
              )}
              {tag}
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <SparklesIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm">Be the first to share something!</p>
          </div>
        )}

        {filteredPosts.map((post) => {
          const isLiked = post.likedBy.includes(clerkUser?.id || "");
          const isAuthor = post.authorId === clerkUser?.id;
          const isExpanded = expandedComments.has(post._id);

          return (
            <Card key={post._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={post.authorImage} />
                    <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{post.authorName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(new Date(post._creationTime), "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                  {isAuthor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={async () => {
                        await removePost({ postId: post._id });
                        toast.success("Post deleted");
                      }}
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>

                {post.codeSnippet && (
                  <div className="mt-3 rounded-md overflow-hidden border">
                    <div className="bg-muted/50 px-3 py-1 text-[10px] font-mono text-muted-foreground border-b flex items-center gap-1">
                      <CodeIcon className="h-3 w-3" />
                      {post.codeSnippet.language}
                    </div>
                    <pre className="p-3 text-xs font-mono bg-zinc-950 text-zinc-200 overflow-x-auto max-h-72">
                      <code>{post.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px] cursor-pointer"
                        onClick={() => setActiveTag(tag)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex-col items-stretch pt-0 gap-2">
                {/* Action buttons */}
                <div className="flex items-center gap-4 border-t pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs gap-1.5 ${isLiked ? "text-red-500" : ""}`}
                    onClick={() => toggleLike({ postId: post._id })}
                  >
                    <HeartIcon
                      className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                    />
                    {post.likeCount > 0 && post.likeCount}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={() => {
                      setExpandedComments((prev) => {
                        const next = new Set(prev);
                        if (next.has(post._id)) next.delete(post._id);
                        else next.add(post._id);
                        return next;
                      });
                    }}
                  >
                    <MessageCircleIcon className="h-4 w-4" />
                    {post.commentCount > 0 && post.commentCount}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-1.5 ml-auto">
                    <BookmarkIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Comments Section */}
                {isExpanded && (
                  <PostComments postId={post._id} />
                )}

                {/* Comment Input */}
                {isExpanded && (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={commentInputs[post._id] || ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post._id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddComment(post._id);
                        }
                      }}
                      className="h-8 text-xs"
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleAddComment(post._id)}
                      disabled={!commentInputs[post._id]?.trim()}
                    >
                      <SendIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Sub component for lazy-loaded comments
function PostComments({ postId }: { postId: Id<"posts"> }) {
  const comments = useQuery(api.posts.getCommentsByPost, { postId });

  if (!comments) return <Loader2Icon className="h-4 w-4 animate-spin mx-auto" />;

  if (comments.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-2">
        No comments yet
      </p>
    );
  }

  return (
    <div className="space-y-2 py-2 border-t">
      {comments.map((comment) => (
        <div key={comment._id} className="flex gap-2">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={comment.authorImage} />
            <AvatarFallback className="text-[8px]">
              {comment.authorName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="text-xs font-semibold">{comment.authorName}</span>
            <p className="text-xs text-muted-foreground">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeedPage;
