"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { use, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  HashIcon,
  PlusIcon,
  SendIcon,
  UsersIcon,
  SettingsIcon,
  MegaphoneIcon,
  MicIcon,
  ArrowLeftIcon,
  Loader2Icon,
  CodeIcon,
  SmileIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🔥", "👀"];

function SpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const spaceId = id as Id<"spaces">;
  const { user: clerkUser } = useUser();

  const space = useQuery(api.spaces.getById, { spaceId });
  const channels = useQuery(api.channels.getBySpace, { spaceId });
  const users = useQuery(api.users.getUsers);
  const leaveSpace = useMutation(api.spaces.leave);
  const createChannel = useMutation(api.channels.create);
  const sendMessage = useMutation(api.messages.send);
  const toggleReaction = useMutation(api.messages.toggleReaction);
  const deleteMessage = useMutation(api.messages.remove);
  const setTyping = useMutation(api.messages.setTyping);
  const clearTyping = useMutation(api.messages.clearTyping);

  const [selectedChannelId, setSelectedChannelId] = useState<Id<"channels"> | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<"text" | "voice" | "announcements">("text");
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [codeContent, setCodeContent] = useState("");
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-select first channel
  const activeChannelId = selectedChannelId || channels?.[0]?._id || null;

  const messages = useQuery(
    api.messages.getByChannel,
    activeChannelId ? { channelId: activeChannelId } : "skip"
  );

  const typingUsers = useQuery(
    api.messages.getTypingUsers,
    activeChannelId ? { channelId: activeChannelId } : "skip"
  );

  const isMember = space?.memberIds.includes(clerkUser?.id || "");
  const isOwner = space?.ownerId === clerkUser?.id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup typing on unmount
  useEffect(() => {
    return () => {
      if (activeChannelId) {
        clearTyping({ channelId: activeChannelId }).catch(() => {});
      }
    };
  }, [activeChannelId, clearTyping]);

  const handleTyping = () => {
    if (!activeChannelId) return;
    setTyping({ channelId: activeChannelId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      clearTyping({ channelId: activeChannelId }).catch(() => {});
    }, 2500);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !codeContent.trim()) return;
    if (!activeChannelId) return;

    try {
      await sendMessage({
        content: messageInput || (codeContent ? "Shared a code snippet" : ""),
        channelId: activeChannelId,
        type: "channel",
        codeSnippet: codeContent
          ? { language: codeLanguage, code: codeContent }
          : undefined,
      });
      setMessageInput("");
      setCodeContent("");
      setShowCodeSnippet(false);
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      await createChannel({
        name: newChannelName.toLowerCase().replace(/\s+/g, "-"),
        spaceId,
        type: newChannelType,
      });
      toast.success("Channel created!");
      setShowCreateChannel(false);
      setNewChannelName("");
    } catch {
      toast.error("Failed to create channel");
    }
  };

  if (!space) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "announcements":
        return <MegaphoneIcon className="h-4 w-4" />;
      case "voice":
        return <MicIcon className="h-4 w-4" />;
      default:
        return <HashIcon className="h-4 w-4" />;
    }
  };

  const getMemberInfo = (clerkId: string) => {
    const user = users?.find((u) => u.clerkId === clerkId);
    return user;
  };

  return (
    <div className="h-[calc(100vh-4rem-1px)] flex overflow-hidden">
      {/* Sidebar - Channels */}
      <div className="w-60 border-r bg-muted/20 flex flex-col shrink-0">
        {/* Space Header */}
        <div className="p-4 border-b">
          <Link href="/spaces" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeftIcon className="h-3 w-3" />
            Back to Spaces
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">{space.icon || "💻"}</span>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm truncate">{space.name}</h2>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <UsersIcon className="h-2.5 w-2.5" />
                {space.memberCount} members
              </p>
            </div>
          </div>
        </div>

        {/* Channel List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="flex items-center justify-between px-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Channels
              </span>
              {isOwner && (
                <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
                  <DialogTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Create Channel</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-3">
                      <div>
                        <Label>Channel Name</Label>
                        <Input
                          placeholder="general-chat"
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={newChannelType}
                          onValueChange={(v) => setNewChannelType(v as "text" | "voice" | "announcements")}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="voice">Voice</SelectItem>
                            <SelectItem value="announcements">Announcements</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreateChannel} className="w-full">
                        Create
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {channels?.map((channel) => (
              <button
                key={channel._id}
                onClick={() => setSelectedChannelId(channel._id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                  activeChannelId === channel._id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                {getChannelIcon(channel.type)}
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </div>

          {/* Members */}
          <div className="p-2 mt-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2">
              Members ({space.memberCount})
            </span>
            <div className="mt-1 space-y-0.5">
              {space.memberIds.slice(0, 20).map((memberId) => {
                const member = getMemberInfo(memberId);
                return (
                  <div
                    key={memberId}
                    className="flex items-center gap-2 px-2 py-1 rounded text-xs text-muted-foreground"
                  >
                    <div className="relative">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={member?.image} />
                        <AvatarFallback className="text-[8px]">
                          {member?.name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {member?.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-background" />
                      )}
                    </div>
                    <span className="truncate">
                      {member?.name || "User"}
                      {memberId === space.ownerId && (
                        <Badge variant="outline" className="text-[8px] ml-1 px-1 py-0">
                          Owner
                        </Badge>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Leave Space */}
        {isMember && !isOwner && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-destructive hover:text-destructive"
              onClick={async () => {
                await leaveSpace({ spaceId });
                toast.success("Left space");
              }}
            >
              Leave Space
            </Button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel Header */}
        {activeChannelId && (
          <div className="h-12 border-b flex items-center px-4 gap-2 shrink-0">
            {getChannelIcon(channels?.find((c) => c._id === activeChannelId)?.type || "text")}
            <span className="font-medium text-sm">
              {channels?.find((c) => c._id === activeChannelId)?.name || "general"}
            </span>
            {channels?.find((c) => c._id === activeChannelId)?.description && (
              <span className="text-xs text-muted-foreground ml-2">
                — {channels?.find((c) => c._id === activeChannelId)?.description}
              </span>
            )}
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages?.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <HashIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            )}
            {messages?.map((msg) => (
              <div
                key={msg._id}
                className="flex gap-3 group relative"
                onMouseEnter={() => setHoveredMessageId(msg._id)}
                onMouseLeave={() => { setHoveredMessageId(null); setReactionPickerMsgId(null); }}
              >
                <Avatar className="h-8 w-8 mt-0.5 shrink-0">
                  <AvatarImage src={msg.senderImage} />
                  <AvatarFallback className="text-xs">
                    {msg.senderName?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">{msg.senderName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(msg._creationTime), "MMM d, h:mm a")}
                    </span>
                    {msg.isEdited && (
                      <span className="text-[10px] text-muted-foreground">(edited)</span>
                    )}
                  </div>
                  {msg.isDeleted ? (
                    <p className="text-sm text-muted-foreground italic">This message was deleted</p>
                  ) : (
                    <>
                      {msg.content && (
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap wrap-break-word">
                          {msg.content}
                        </p>
                      )}
                      {msg.codeSnippet && (
                        <div className="mt-1 rounded-md overflow-hidden border">
                          <div className="bg-muted/50 px-3 py-1 text-[10px] font-mono text-muted-foreground border-b flex items-center gap-1">
                            <CodeIcon className="h-3 w-3" />
                            {msg.codeSnippet.language}
                          </div>
                          <pre className="p-3 text-xs font-mono bg-zinc-950 text-zinc-200 overflow-x-auto">
                            <code>{msg.codeSnippet.code}</code>
                          </pre>
                        </div>
                      )}
                      {/* Reactions display */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(
                            msg.reactions.reduce((acc: Record<string, { count: number; users: string[] }>, r: { emoji: string; userId: string }) => {
                              if (!acc[r.emoji]) acc[r.emoji] = { count: 0, users: [] };
                              acc[r.emoji].count++;
                              acc[r.emoji].users.push(r.userId);
                              return acc;
                            }, {})
                          ).map(([emoji, data]) => (
                            <button
                              key={emoji}
                              onClick={() => toggleReaction({ messageId: msg._id, emoji })}
                              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                                (data as { count: number; users: string[] }).users.includes(clerkUser?.id || "")
                                  ? "bg-blue-500/20 border-blue-500/50"
                                  : "hover:bg-muted border-border"
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px]">{(data as { count: number; users: string[] }).count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Hover action bar */}
                {hoveredMessageId === msg._id && !msg.isDeleted && (
                  <div className="absolute -top-3 right-0 flex items-center bg-background border rounded-md shadow-sm">
                    <button
                      className="p-1.5 hover:bg-muted rounded-l-md"
                      onClick={() => setReactionPickerMsgId(reactionPickerMsgId === msg._id ? null : msg._id)}
                    >
                      <SmileIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    {msg.senderId === clerkUser?.id && (
                      <button
                        className="p-1.5 hover:bg-destructive/10 rounded-r-md"
                        onClick={() => deleteMessage({ messageId: msg._id })}
                      >
                        <TrashIcon className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    )}
                  </div>
                )}

                {/* Reaction picker popup */}
                {reactionPickerMsgId === msg._id && (
                  <div className="absolute -top-10 right-0 bg-background border rounded-lg shadow-lg p-1 flex gap-0.5 z-10">
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          toggleReaction({ messageId: msg._id, emoji });
                          setReactionPickerMsgId(null);
                        }}
                        className="hover:bg-muted p-1 rounded text-sm"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        {isMember && activeChannelId && (
          <div className="border-t p-3 shrink-0">
            {/* Typing indicator */}
            {typingUsers && typingUsers.length > 0 && (
              <div className="flex items-center gap-1.5 px-1 pb-1.5 text-xs text-muted-foreground">
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.join(", ")} are typing...`}
              </div>
            )}
            {showCodeSnippet && (
              <div className="mb-2 border rounded-md overflow-hidden">
                <div className="flex items-center gap-2 px-2 py-1 bg-muted/30 border-b">
                  <CodeIcon className="h-3 w-3 text-muted-foreground" />
                  <select
                    className="text-xs bg-transparent outline-none"
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                  >
                    {["javascript", "python", "java", "cpp", "typescript", "go", "rust", "ruby"].map(
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
                  className="w-full h-24 p-2 text-xs font-mono bg-zinc-950 text-zinc-200 resize-none outline-none"
                  placeholder="Paste your code here..."
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setShowCodeSnippet(!showCodeSnippet)}
              >
                <CodeIcon className="h-4 w-4" />
              </Button>
              <Input
                placeholder={`Message #${channels?.find((c) => c._id === activeChannelId)?.name || "general"}...`}
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="h-9"
              />
              <Button
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleSendMessage}
                disabled={!messageInput.trim() && !codeContent.trim()}
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpaceDetailPage;
