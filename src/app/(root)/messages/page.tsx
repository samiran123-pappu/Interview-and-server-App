"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquareIcon,
  SendIcon,
  SearchIcon,
  Loader2Icon,
  CodeIcon,
  UserIcon,
  SmileIcon,
  TrashIcon,
  CircleIcon,
  PenIcon,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import toast from "react-hot-toast";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🔥", "👀", "💯", "🙌"];

function MessagesPage() {
  const { user: clerkUser } = useUser();
  const users = useQuery(api.users.getUsers);
  const conversations = useQuery(api.conversations.getMyConversations);
  const getOrCreateConvo = useMutation(api.conversations.getOrCreate);
  const sendMessage = useMutation(api.messages.send);
  const toggleReaction = useMutation(api.messages.toggleReaction);
  const removeMessage = useMutation(api.messages.remove);
  const setTypingMutation = useMutation(api.messages.setTyping);
  const clearTypingMutation = useMutation(api.messages.clearTyping);

  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [codeContent, setCodeContent] = useState("");
  const [showReactionsFor, setShowReactionsFor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messages = useQuery(
    api.messages.getByConversation,
    selectedConvoId ? { conversationId: selectedConvoId } : "skip"
  );

  const typingUsers = useQuery(
    api.messages.getTypingUsers,
    selectedConvoId ? { conversationId: selectedConvoId } : "skip"
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator
  const handleTyping = useCallback(() => {
    if (!selectedConvoId) return;
    setTypingMutation({ conversationId: selectedConvoId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      clearTypingMutation({ conversationId: selectedConvoId });
    }, 2500);
  }, [selectedConvoId, setTypingMutation, clearTypingMutation]);

  const otherUsers = (users ?? []).filter(
    (u) => u.clerkId !== clerkUser?.id
  );

  const filteredUsers = otherUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOtherUserId = (participantIds: string[]) =>
    participantIds.find((id) => id !== clerkUser?.id) || "";

  const getOtherUser = (participantIds: string[]) => {
    const otherId = getOtherUserId(participantIds);
    return users?.find((u) => u.clerkId === otherId);
  };

  const handleStartConversation = async (otherUserId: string) => {
    try {
      const result = await getOrCreateConvo({ otherUserId });
      setSelectedConvoId(result.conversationId);
      setSearchQuery("");
    } catch {
      toast.error("Failed to start conversation");
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !codeContent.trim()) return;
    if (!selectedConvoId) return;

    try {
      clearTypingMutation({ conversationId: selectedConvoId });
      await sendMessage({
        content: messageInput || (codeContent ? "Shared a code snippet" : ""),
        conversationId: selectedConvoId,
        type: "dm",
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

  if (users === undefined) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Find the other user for the selected conversation header
  const selectedConvoOther = selectedConvoId
    ? conversations
        ?.map((c) => ({
          convoId: [...c.participantIds].sort().join("-"),
          other: getOtherUser(c.participantIds),
        }))
        .find((c) => c.convoId === selectedConvoId)?.other
    : null;

  return (
    <div className="h-[calc(100vh-4rem-1px)] flex overflow-hidden">
      {/* Sidebar - Conversations */}
      <div className="w-72 border-r flex flex-col shrink-0">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <MessageSquareIcon className="h-5 w-5 text-blue-500" />
            Messages
          </h2>
        </div>

        {/* Search / Start new conversation */}
        <div className="p-3 border-b">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          {searchQuery && (
            <div className="mt-2 space-y-1 max-h-48 overflow-auto">
              {filteredUsers.map((user) => (
                <button
                  key={user.clerkId}
                  onClick={() => handleStartConversation(user.clerkId)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="text-[8px]">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <CircleIcon className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 fill-green-500 text-green-500" />
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <span className="truncate text-xs block">{user.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {user.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No users found
                </p>
              )}
            </div>
          )}
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations?.length === 0 && !searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                <UserIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No conversations yet</p>
                <p className="text-[10px]">Search for a user to start chatting</p>
              </div>
            )}
            {conversations
              ?.sort(
                (a, b) =>
                  (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)
              )
              .map((convo) => {
                const other = getOtherUser(convo.participantIds);
                const convoId = [...convo.participantIds].sort().join("-");
                return (
                  <button
                    key={convo._id}
                    onClick={() => setSelectedConvoId(convoId)}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors ${
                      selectedConvoId === convoId
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={other?.image} />
                        <AvatarFallback className="text-xs">
                          {other?.name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {other?.isOnline && (
                        <CircleIcon className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500 bg-background rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">
                        {other?.name || "User"}
                      </p>
                      {convo.lastMessagePreview && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {convo.lastMessagePreview}
                        </p>
                      )}
                    </div>
                    {convo.lastMessageTime && (
                      <span className="text-[9px] text-muted-foreground shrink-0">
                        {format(new Date(convo.lastMessageTime), "h:mm a")}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedConvoId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquareIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose someone to chat with</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header with user info */}
            {selectedConvoOther && (
              <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/20 shrink-0">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedConvoOther.image} />
                    <AvatarFallback className="text-xs">
                      {selectedConvoOther.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {selectedConvoOther.isOnline && (
                    <CircleIcon className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 fill-green-500 text-green-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">{selectedConvoOther.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {selectedConvoOther.isOnline ? "Active now" : "Offline"}
                    {selectedConvoOther.bio && ` · ${selectedConvoOther.bio.substring(0, 40)}`}
                  </p>
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages?.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground text-sm">
                    Start the conversation! 👋
                  </div>
                )}
                {messages?.map((msg) => {
                  const isMe = msg.senderId === clerkUser?.id;
                  const isDeleted = msg.isDeleted;
                  return (
                    <div
                      key={msg._id}
                      className={`flex gap-3 group ${isMe ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="h-7 w-7 mt-0.5 shrink-0">
                        <AvatarImage src={msg.senderImage} />
                        <AvatarFallback className="text-[10px]">
                          {msg.senderName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`max-w-[70%] ${isMe ? "text-right" : ""}`}
                      >
                        <div
                          className={`inline-block rounded-lg px-3 py-2 text-sm ${
                            isDeleted
                              ? "bg-muted/50 italic text-muted-foreground"
                              : isMe
                                ? "bg-blue-600 text-white"
                                : "bg-muted"
                          }`}
                        >
                          {msg.content && (
                            <p className="whitespace-pre-wrap wrap-break-word">
                              {msg.content}
                            </p>
                          )}
                          {msg.codeSnippet && !isDeleted && (
                            <div className="mt-1 rounded overflow-hidden border border-white/10">
                              <div className="bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-400 border-b border-white/10">
                                {msg.codeSnippet.language}
                              </div>
                              <pre className="p-2 text-xs font-mono bg-zinc-950 text-zinc-200 overflow-x-auto text-left">
                                <code>{msg.codeSnippet.code}</code>
                              </pre>
                            </div>
                          )}
                        </div>

                        {/* Reactions display */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className={`flex flex-wrap gap-1 mt-0.5 ${isMe ? "justify-end" : ""}`}>
                            {Object.entries(
                              msg.reactions.reduce(
                                (acc, r) => {
                                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                  return acc;
                                },
                                {} as Record<string, number>
                              )
                            ).map(([emoji, count]) => {
                              const iReacted = msg.reactions?.some(
                                (r) => r.emoji === emoji && r.userId === clerkUser?.id
                              );
                              return (
                                <button
                                  key={emoji}
                                  className={`text-xs rounded-full px-1.5 py-0.5 border transition-colors ${
                                    iReacted
                                      ? "bg-blue-500/10 border-blue-500/30"
                                      : "bg-muted/80 border-transparent hover:border-muted-foreground/20"
                                  }`}
                                  onClick={() =>
                                    toggleReaction({ messageId: msg._id, emoji })
                                  }
                                >
                                  {emoji} {count > 1 && <span className="text-[10px]">{count}</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Action buttons */}
                        {!isDeleted && (
                          <div
                            className={`flex gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                              isMe ? "justify-end" : ""
                            }`}
                          >
                            <button
                              className="text-muted-foreground hover:text-foreground p-0.5"
                              onClick={() =>
                                setShowReactionsFor(
                                  showReactionsFor === msg._id ? null : msg._id
                                )
                              }
                            >
                              <SmileIcon className="h-3.5 w-3.5" />
                            </button>
                            {isMe && (
                              <button
                                className="text-muted-foreground hover:text-red-500 p-0.5"
                                onClick={() =>
                                  removeMessage({ messageId: msg._id })
                                }
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Quick reactions picker */}
                        {showReactionsFor === msg._id && (
                          <div
                            className={`flex gap-0.5 bg-background border rounded-full px-1.5 py-1 shadow-lg mt-1 w-fit ${
                              isMe ? "ml-auto" : ""
                            }`}
                          >
                            {QUICK_REACTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                className="hover:scale-125 transition-transform text-base p-0.5"
                                onClick={() => {
                                  toggleReaction({ messageId: msg._id, emoji });
                                  setShowReactionsFor(null);
                                }}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-[10px] text-muted-foreground">
                            {format(new Date(msg._creationTime), "h:mm a")}
                          </p>
                          {msg.isEdited && (
                            <span className="text-[9px] text-muted-foreground italic flex items-center gap-0.5">
                              <PenIcon className="h-2 w-2" /> edited
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {typingUsers && typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs">
                      {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-3 shrink-0">
              {showCodeSnippet && (
                <div className="mb-2 border rounded-md overflow-hidden">
                  <div className="flex items-center gap-2 px-2 py-1 bg-muted/30 border-b">
                    <CodeIcon className="h-3 w-3 text-muted-foreground" />
                    <select
                      className="text-xs bg-transparent outline-none"
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                    >
                      {["javascript", "python", "java", "cpp", "typescript", "go"].map(
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
                    className="w-full h-20 p-2 text-xs font-mono bg-zinc-950 text-zinc-200 resize-none outline-none"
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
                  placeholder="Type a message..."
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
          </>
        )}
      </div>
    </div>
  );
}

export default MessagesPage;
