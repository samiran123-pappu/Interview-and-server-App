"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  BellIcon,
  CalendarIcon,
  MessageSquareIcon,
  HeartIcon,
  AwardIcon,
  UsersIcon,
  AtSignIcon,
  CheckCheckIcon,
  BellOffIcon,
  BellRingIcon,
  Volume2Icon,
  VolumeXIcon,
  TrashIcon,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "./ui/badge";

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  interview_scheduled: <CalendarIcon className="h-4 w-4 text-blue-500" />,
  interview_reminder: <CalendarIcon className="h-4 w-4 text-orange-500" />,
  message: <MessageSquareIcon className="h-4 w-4 text-emerald-500" />,
  post_like: <HeartIcon className="h-4 w-4 text-red-500" />,
  post_comment: <MessageSquareIcon className="h-4 w-4 text-violet-500" />,
  space_invite: <UsersIcon className="h-4 w-4 text-indigo-500" />,
  badge_earned: <AwardIcon className="h-4 w-4 text-yellow-500" />,
  mention: <AtSignIcon className="h-4 w-4 text-blue-500" />,
};

function NotificationBell() {
  const notifications = useQuery(api.notifications.getMyNotifications);
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.remove);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotifsEnabled, setBrowserNotifsEnabled] = useState(false);
  const prevUnreadRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element for notification sound
  useEffect(() => {
    // Create a simple notification beep using Web Audio API
    audioRef.current = null; // We'll use Web Audio API instead
  }, []);

  // Play notification sound using Web Audio API (no file needed)
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio not available
    }
  }, [soundEnabled]);

  // Request browser notification permission
  const requestBrowserNotifs = useCallback(async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setBrowserNotifsEnabled(permission === "granted");
  }, []);

  // Check if browser notifications are already enabled
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setBrowserNotifsEnabled(true);
    }
  }, []);

  // Watch for new notifications and trigger alerts
  useEffect(() => {
    const currentCount = unreadCount ?? 0;
    if (currentCount > prevUnreadRef.current && prevUnreadRef.current >= 0) {
      // New notification arrived
      playNotificationSound();

      // Show browser notification
      if (browserNotifsEnabled && notifications && notifications.length > 0) {
        const latest = notifications[0];
        if (latest && !latest.isRead) {
          try {
            new Notification(latest.title, {
              body: latest.body,
              icon: latest.fromUserImage || "/favicon.ico",
              tag: latest._id,
            });
          } catch {
            // Browser notification failed
          }
        }
      }
    }
    prevUnreadRef.current = currentCount;
  }, [unreadCount, notifications, playNotificationSound, browserNotifsEnabled]);

  const groupedNotifs = notifications?.reduce(
    (acc, notif) => {
      const today = new Date();
      const notifDate = new Date(notif._creationTime);
      const isToday = notifDate.toDateString() === today.toDateString();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = notifDate.toDateString() === yesterday.toDateString();

      const group = isToday ? "Today" : isYesterday ? "Yesterday" : "Earlier";
      if (!acc[group]) acc[group] = [];
      acc[group].push(notif);
      return acc;
    },
    {} as Record<string, typeof notifications>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {(unreadCount ?? 0) > 0 ? (
            <BellRingIcon className="h-5 w-5 animate-[wiggle_0.5s_ease-in-out]" />
          ) : (
            <BellIcon className="h-5 w-5" />
          )}
          {(unreadCount ?? 0) > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 animate-pulse">
              {unreadCount! > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30">
          <h3 className="font-semibold text-sm">Notifications</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            >
              {soundEnabled ? (
                <Volume2Icon className="h-3.5 w-3.5" />
              ) : (
                <VolumeXIcon className="h-3.5 w-3.5" />
              )}
            </Button>
            {!browserNotifsEnabled && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={requestBrowserNotifs}
                title="Enable browser notifications"
              >
                <BellOffIcon className="h-3.5 w-3.5" />
              </Button>
            )}
            {(unreadCount ?? 0) > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => markAllAsRead()}
              >
                <CheckCheckIcon className="h-3 w-3 mr-1" />
                Read all
              </Button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <ScrollArea className="max-h-112">
          {notifications?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BellIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">We&apos;ll let you know when something happens!</p>
            </div>
          )}
          {groupedNotifs &&
            Object.entries(groupedNotifs).map(([group, notifs]) => (
              <div key={group}>
                <div className="px-4 py-1.5 bg-muted/20 sticky top-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {group}
                  </p>
                </div>
                {notifs?.map((notif) => {
                  const Wrapper = notif.linkUrl ? Link : "div";
                  const wrapperProps = notif.linkUrl ? { href: notif.linkUrl } : {};
                  return (
                    <Wrapper
                      key={notif._id}
                      {...(wrapperProps as { href: string })}
                    >
                      <div
                        className={`flex gap-3 px-4 py-3 border-b last:border-0 transition-colors cursor-pointer hover:bg-muted/50 group ${
                          !notif.isRead
                            ? "bg-primary/5 border-l-2 border-l-blue-500"
                            : ""
                        }`}
                        onClick={() => {
                          if (!notif.isRead) markAsRead({ notificationId: notif._id });
                        }}
                      >
                        <div className="shrink-0 mt-0.5">
                          {notif.fromUserImage ? (
                            <div className="relative">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={notif.fromUserImage} />
                                <AvatarFallback className="text-[10px]">
                                  {notif.fromUserName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-background flex items-center justify-center">
                                {NOTIF_ICONS[notif.type] || (
                                  <BellIcon className="h-2.5 w-2.5" />
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                              {NOTIF_ICONS[notif.type] || (
                                <BellIcon className="h-4 w-4" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{notif.title}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                            {notif.body}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] text-muted-foreground">
                              {format(new Date(notif._creationTime), "h:mm a")}
                            </p>
                            <Badge variant="outline" className="text-[8px] h-3.5 px-1">
                              {notif.type.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          {!notif.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteNotification({ notificationId: notif._id });
                            }}
                          >
                            <TrashIcon className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </Wrapper>
                  );
                })}
              </div>
            ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationBell;
