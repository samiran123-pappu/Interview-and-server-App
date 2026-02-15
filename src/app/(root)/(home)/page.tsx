"use client"
import ActionCard from "@/components/ActionCard"
import { QUICK_ACTIONS } from "@/constants"
import { useUserRole } from "@/hooks/useUserRole"
import { Loader2Icon, ZapIcon, FlameIcon, TrophyIcon, CodeIcon, ArrowRightIcon, PlusIcon, CircleIcon } from "lucide-react"
import { useState } from "react"
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import MeetingModal from "@/components/MeetingModal"
import MeetingCard from "@/components/MeetingCard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

const STATUS_EMOJIS = ["💻", "🎯", "☕", "🔥", "📚", "🎮", "🎵", "✈️", "🌙", "💪", "🧠", "🎉"];

export default function Home() {
  const router = useRouter();
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const authenticated = isLoaded && isSignedIn;
  const { isInterviewer, isCandidate } = useUserRole()
  const [showModal, setShowModal] = useState(false)
  const interviews = useQuery(api.interviews.getMyInterviews, authenticated ? {} : "skip");
  const me = useQuery(api.users.getMe, authenticated ? {} : "skip");
  const mySpaces = useQuery(api.spaces.getMySpaces, authenticated ? {} : "skip");
  const unreadNotifs = useQuery(api.notifications.getUnreadCount, authenticated ? {} : "skip");
  const users = useQuery(api.users.getUsers, authenticated ? {} : "skip");
  const statuses = useQuery(api.statusUpdates.getActiveStatuses, authenticated ? {} : "skip");
  const setStatus = useMutation(api.statusUpdates.setStatus);
  const clearStatus = useMutation(api.statusUpdates.clearStatus);
  const [modalType, setModalType] = useState<"start" | "join">();
  const [statusInput, setStatusInput] = useState("");
  const [statusEmoji, setStatusEmoji] = useState("💻");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedStatus, setSelectedStatus] = useState<any>(null);

  const onlineUsers = users?.filter((u) => u.isOnline && u.clerkId !== clerkUser?.id) || [];
  const myStatus = statuses?.find((s) => s.userId === clerkUser?.id);

  const handleQuickAction = (title: string) => {
    switch(title){
      case "New Call":
        setModalType("start");
        setShowModal(true)
        break;
      case "Join Interview":
        setModalType("join");
        setShowModal(true)
        break;
      default:
        router.push(`/${title.toLocaleLowerCase()}`);
    }
  }

  const handleSetStatus = async () => {
    if (!statusInput.trim()) return;
    await setStatus({ content: statusInput, emoji: statusEmoji });
    setStatusInput("");
    setShowStatusDialog(false);
  };

  return <div className="container max-w-7xl mx-auto p-6">

    {/* ── INSTAGRAM-LIKE STATUS BAR ─────────────────────────────── */}
    <div className="mb-6">
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2">
          {/* Your status / Add status */}
          <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
            <DialogTrigger asChild>
              <button className="flex flex-col items-center gap-1 shrink-0 group">
                <div className={`relative h-14 w-14 rounded-full flex items-center justify-center ${
                  myStatus
                    ? "bg-linear-to-r from-violet-500 to-pink-500 p-0.5"
                    : "border-2 border-dashed border-muted-foreground/30"
                }`}>
                  {myStatus ? (
                    <div className="bg-background rounded-full h-full w-full flex items-center justify-center text-xl">
                      {myStatus.emoji || "💻"}
                    </div>
                  ) : (
                    <PlusIcon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground max-w-14 truncate">
                  {myStatus ? "Your status" : "Set status"}
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Set your status</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {STATUS_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setStatusEmoji(e)}
                      className={`text-xl p-1.5 rounded-md transition-colors ${
                        statusEmoji === e ? "bg-accent ring-2 ring-blue-500" : "hover:bg-muted"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="What are you up to?"
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSetStatus()}
                  maxLength={100}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSetStatus} disabled={!statusInput.trim()} className="flex-1">
                    Set Status
                  </Button>
                  {myStatus && (
                    <Button variant="outline" onClick={() => { clearStatus(); setShowStatusDialog(false); }}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Other users' statuses */}
          {statuses?.filter((s) => s.userId !== clerkUser?.id).map((status) => (
            <button
              key={status._id}
              onClick={() => setSelectedStatus(status)}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <div className="h-14 w-14 rounded-full bg-linear-to-r from-violet-500 to-pink-500 p-0.5">
                <Avatar className="h-full w-full border-2 border-background">
                  <AvatarImage src={status.userImage} />
                  <AvatarFallback className="text-xs">{status.userName?.[0]}</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-[10px] text-muted-foreground max-w-14 truncate">
                {status.userName?.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Status viewer popup */}
      {selectedStatus && (
        <Dialog open={!!selectedStatus} onOpenChange={() => setSelectedStatus(null)}>
          <DialogContent className="sm:max-w-sm">
            <div className="flex flex-col items-center gap-4 py-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedStatus.userImage} />
                <AvatarFallback>{selectedStatus.userName?.[0]}</AvatarFallback>
              </Avatar>
              <p className="font-semibold">{selectedStatus.userName}</p>
              <div className="text-center">
                <span className="text-3xl">{selectedStatus.emoji}</span>
                <p className="mt-2 text-lg">{selectedStatus.content}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>

    {/* WELCOME SECTION */}
    <div className="rounded-lg bg-linear-to-r from-emerald-600/10 via-teal-500/5 to-transparent p-6 border shadow-sm mb-8">
      <h1 className="text-4xl font-bold bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
        Welcome back{me?.name ? `, ${me.name.split(" ")[0]}` : ""}!
      </h1>
      <p className="text-muted-foreground mt-2">
        {isInterviewer ? "Manage interviews, explore spaces, and connect with the community." : "Practice coding, join spaces, and track your progress."}
      </p>

      {/* Quick Stats */}
      {me && (
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2 bg-background/80 rounded-full px-4 py-1.5 border">
            <ZapIcon className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold">{me.xp || 0} XP</span>
          </div>
          <div className="flex items-center gap-2 bg-background/80 rounded-full px-4 py-1.5 border">
            <TrophyIcon className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold">Level {me.level || 1}</span>
          </div>
          <div className="flex items-center gap-2 bg-background/80 rounded-full px-4 py-1.5 border">
            <FlameIcon className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold">{me.streak || 0} day streak</span>
          </div>
          <div className="flex items-center gap-2 bg-background/80 rounded-full px-4 py-1.5 border">
            <CodeIcon className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold">{me.questionsCompleted || 0} solved</span>
          </div>
        </div>
      )}
    </div>

    {isInterviewer ? (
      <>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {QUICK_ACTIONS.map((action) => (
            <ActionCard
              key={action.title}
              action={action}
              onClick={() => handleQuickAction(action.title)}
            />
          ))}
        </div>
        <MeetingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
          isJoinMeeting={modalType === "join"}
        />
      </>
    ) : (
      <>
        <div>
          <h1 className="text-3xl font-bold">Your Interviews</h1>
          <p className="text-muted-foreground mt-1">View and join your scheduled interviews</p>
        </div>
        <div className="mt-8">
          {interviews === undefined ? (
            <div className="flex justify-center py-12">
              <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : interviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {interviews.map((interview) => (
                <MeetingCard key={interview._id} interview={interview} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              You have no scheduled interviews at the moment
            </div>
          )}
        </div>
      </>
    )}

    {/* Community Section */}
    <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Your Spaces */}
      <Card className="col-span-1">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Your Spaces</h3>
            <Link href="/spaces" className="text-xs text-blue-500 hover:underline flex items-center gap-0.5">
              View all <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
          {mySpaces === undefined ? (
            <Loader2Icon className="h-5 w-5 animate-spin mx-auto" />
          ) : mySpaces.length > 0 ? (
            <div className="space-y-2">
              {mySpaces.slice(0, 4).map((space) => (
                <Link key={space._id} href={`/spaces/${space._id}`}>
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <span className="text-lg">{space.icon || "💻"}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{space.name}</p>
                      <p className="text-[10px] text-muted-foreground">{space.memberCount} members</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              <Link href="/spaces" className="text-blue-500 hover:underline">Join a space</Link> to connect with others
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="col-span-1">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-3">Explore</h3>
          <div className="space-y-2">
            {[
              { href: "/feed", label: "Discussion Feed", desc: "Share and discover ideas", icon: "📰" },
              { href: "/leaderboard", label: "Leaderboard", desc: "See top performers", icon: "🏆" },
              { href: "/messages", label: "Messages", desc: "Chat with others", icon: "💬" },
              { href: "/spaces", label: "Browse Spaces", desc: "Find your community", icon: "🌐" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Online Now — Discord-style */}
      <Card className="col-span-1">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-1.5">
              <CircleIcon className="h-2.5 w-2.5 fill-green-500 text-green-500" />
              Online Now
            </h3>
            <span className="text-xs text-muted-foreground">{onlineUsers.length} online</span>
          </div>
          {onlineUsers.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {onlineUsers.slice(0, 8).map((u) => (
                <Link key={u._id} href={`/profile/${u.clerkId}`}>
                  <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="relative">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={u.image} />
                        <AvatarFallback className="text-[10px]">{u.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{u.name}</p>
                      {statuses?.find((s) => s.userId === u.clerkId) && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {statuses.find((s) => s.userId === u.clerkId)?.emoji}{" "}
                          {statuses.find((s) => s.userId === u.clerkId)?.content}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {onlineUsers.length > 8 && (
                <p className="text-[10px] text-muted-foreground text-center pt-1">
                  +{onlineUsers.length - 8} more online
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No one else online right now</p>
          )}
        </CardContent>
      </Card>

      {/* Badges */}
      {me && me.badges && me.badges.length > 0 && (
        <Card className="col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Your Badges</h3>
              {clerkUser && (
                <Link href={`/profile/${clerkUser.id}`} className="text-xs text-blue-500 hover:underline">
                  Profile
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {me.badges.map((badge) => (
                <Badge key={badge} variant="secondary" className="text-xs">
                  {badge.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
}