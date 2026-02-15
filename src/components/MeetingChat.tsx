"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  MessageSquareIcon,
  SendIcon,
  ChevronDownIcon,
  CodeIcon,
  SmileIcon,
  TrashIcon,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import toast from "react-hot-toast";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "🔥", "👀"];

function MeetingChat({ meetingId }: { meetingId: string }) {
  const { user: clerkUser } = useUser();
  const messages = useQuery(api.messages.getByMeeting, { meetingId });
  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.messages.setTyping);
  const clearTyping = useMutation(api.messages.clearTyping);
  const toggleReaction = useMutation(api.messages.toggleReaction);
  const removeMessage = useMutation(api.messages.remove);
  const typingUsers = useQuery(api.messages.getTypingUsers, { meetingId });

  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [codeContent, setCodeContent] = useState("");
  const [showReactionsFor, setShowReactionsFor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Typing indicator logic
  const handleTyping = useCallback(() => {
    setTyping({ meetingId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      clearTyping({ meetingId });
    }, 2500);
  }, [meetingId, setTyping, clearTyping]);

  const handleSend = async () => {
    if (!messageInput.trim() && !codeContent.trim()) return;
    try {
      clearTyping({ meetingId });
      await sendMessage({
        content: messageInput || (codeContent ? "Shared code" : ""),
        meetingId,
        type: "meeting",
        codeSnippet: codeContent
          ? { language: codeLanguage, code: codeContent }
          : undefined,
      });
      setMessageInput("");
      setCodeContent("");
      setShowCodeInput(false);
    } catch {
      toast.error("Failed to send");
    }
  };

  const unreadCount = messages?.length || 0;

  return (
    <div className="absolute right-4 bottom-20 z-50">
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="rounded-full h-10 w-10 relative shadow-lg"
      >
        <MessageSquareIcon className="h-4 w-4" />
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-bold px-0.5">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="absolute right-0 bottom-12 w-80 bg-background border rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
            <span className="text-sm font-semibold flex items-center gap-1.5">
              <MessageSquareIcon className="h-4 w-4 text-blue-500" />
              Meeting Chat
              {messages && (
                <span className="text-[10px] text-muted-foreground font-normal">
                  ({messages.length})
                </span>
              )}
            </span>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="h-64 p-3">
            <div className="space-y-3">
              {messages?.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">
                  No messages yet. Say hello! 👋
                </p>
              )}
              {messages?.map((msg) => {
                const isMe = msg.senderId === clerkUser?.id;
                const isDeleted = msg.isDeleted;
                return (
                  <div
                    key={msg._id}
                    className={`flex gap-2 group ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarImage src={msg.senderImage} />
                      <AvatarFallback className="text-[8px]">
                        {msg.senderName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[75%] ${isMe ? "text-right" : ""}`}>
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        {msg.senderName}
                        {msg.isEdited && <span className="ml-1 italic">(edited)</span>}
                      </p>
                      <div
                        className={`inline-block rounded-lg px-2.5 py-1.5 text-xs relative ${
                          isDeleted
                            ? "bg-muted/50 italic text-muted-foreground"
                            : isMe
                              ? "bg-blue-600 text-white"
                              : "bg-muted"
                        }`}
                      >
                        {msg.content && <p className="wrap-break-word">{isDeleted ? "This message was deleted" : msg.content}</p>}
                        {msg.codeSnippet && !isDeleted && (
                          <pre className="mt-1 p-1.5 rounded bg-zinc-900 text-zinc-200 text-[10px] font-mono overflow-x-auto text-left">
                            <code>{msg.codeSnippet.code}</code>
                          </pre>
                        )}
                      </div>

                      {/* Reactions display */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className={`flex flex-wrap gap-0.5 mt-0.5 ${isMe ? "justify-end" : ""}`}>
                          {Object.entries(
                            msg.reactions.reduce(
                              (acc, r) => {
                                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                return acc;
                              },
                              {} as Record<string, number>
                            )
                          ).map(([emoji, count]) => (
                            <button
                              key={emoji}
                              className="text-[10px] bg-muted/80 rounded-full px-1 py-0.5 hover:bg-muted transition-colors"
                              onClick={() => toggleReaction({ messageId: msg._id, emoji })}
                            >
                              {emoji} {count > 1 && count}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      {!isDeleted && (
                        <div className={`flex gap-0.5 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? "justify-end" : ""}`}>
                          <button
                            className="text-[10px] text-muted-foreground hover:text-foreground p-0.5"
                            onClick={() => setShowReactionsFor(showReactionsFor === msg._id ? null : msg._id)}
                          >
                            <SmileIcon className="h-3 w-3" />
                          </button>
                          {isMe && (
                            <button
                              className="text-[10px] text-muted-foreground hover:text-red-500 p-0.5"
                              onClick={() => removeMessage({ messageId: msg._id })}
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Quick reactions picker */}
                      {showReactionsFor === msg._id && (
                        <div className={`flex gap-0.5 bg-background border rounded-full px-1 py-0.5 shadow-md mt-0.5 w-fit ${isMe ? "ml-auto" : ""}`}>
                          {QUICK_REACTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              className="hover:scale-125 transition-transform text-sm p-0.5"
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

                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {format(new Date(msg._creationTime), "h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typingUsers && typingUsers.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[10px]">
                    {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Code Input */}
          {showCodeInput && (
            <div className="border-t">
              <div className="flex items-center gap-1 px-2 py-1 bg-muted/30 border-b">
                <select
                  className="text-[10px] bg-transparent outline-none"
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                >
                  {["javascript", "python", "java", "cpp", "typescript", "go"].map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <button
                  className="ml-auto text-[10px] text-muted-foreground"
                  onClick={() => { setShowCodeInput(false); setCodeContent(""); }}
                >
                  ✕
                </button>
              </div>
              <textarea
                className="w-full h-16 p-1.5 text-[10px] font-mono bg-zinc-950 text-zinc-200 resize-none outline-none"
                placeholder="Paste or type code..."
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
              />
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-1.5 p-2 border-t">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => setShowCodeInput(!showCodeInput)}
            >
              <CodeIcon className="h-3.5 w-3.5" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="h-7 text-xs"
            />
            <Button
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleSend}
              disabled={!messageInput.trim() && !codeContent.trim()}
            >
              <SendIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MeetingChat;
