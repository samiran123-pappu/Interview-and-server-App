"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
  TrophyIcon,
  FlameIcon,
  CodeIcon,
  StarIcon,
  EditIcon,
  GlobeIcon,
  MapPinIcon,
  GithubIcon,
  LinkedinIcon,
  Loader2Icon,
  CalendarIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ZapIcon,
  AwardIcon,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import toast from "react-hot-toast";

const BADGE_INFO: Record<string, { label: string; icon: string; color: string }> = {
  first_solve: { label: "First Solve", icon: "🎯", color: "bg-emerald-500/15 text-emerald-500" },
  ten_solves: { label: "10 Solves", icon: "⚡", color: "bg-blue-500/15 text-blue-500" },
  fifty_solves: { label: "50 Solves", icon: "🔥", color: "bg-orange-500/15 text-orange-500" },
  hundred_solves: { label: "100 Solves", icon: "💎", color: "bg-purple-500/15 text-purple-500" },
  week_streak: { label: "7-Day Streak", icon: "📅", color: "bg-amber-500/15 text-amber-500" },
  month_streak: { label: "30-Day Streak", icon: "🏆", color: "bg-yellow-500/15 text-yellow-500" },
  level_5: { label: "Level 5", icon: "⭐", color: "bg-indigo-500/15 text-indigo-500" },
  level_10: { label: "Level 10", icon: "🌟", color: "bg-pink-500/15 text-pink-500" },
};

function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: clerkId } = use(params);
  const { user: currentUser } = useUser();

  const profile = useQuery(api.users.getUserByClerkId, { clerkId });
  const submissions = useQuery(api.codeSubmissions.getByUser, { userId: clerkId });
  const updateProfile = useMutation(api.users.updateProfile);

  const isOwnProfile = currentUser?.id === clerkId;
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    skills: "",
  });

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        bio: editForm.bio || undefined,
        location: editForm.location || undefined,
        website: editForm.website || undefined,
        github: editForm.github || undefined,
        linkedin: editForm.linkedin || undefined,
        skills: editForm.skills
          ? editForm.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
      });
      toast.success("Profile updated!");
      setShowEdit(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const xp = profile.xp || 0;
  const level = profile.level || 1;
  const xpForNextLevel = level * 100;
  const xpProgress = ((xp % 100) / 100) * 100;
  const successCount = submissions?.filter((s) => s.status === "success").length || 0;
  const errorCount = submissions?.filter((s) => s.status === "error").length || 0;

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-linear-to-r from-violet-600 via-blue-500 to-emerald-500" />
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={profile.image} />
              <AvatarFallback className="text-2xl">
                {profile.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 mt-2 sm:mt-12">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <Badge
                  variant="outline"
                  className={
                    profile.role === "interviewer"
                      ? "border-blue-500 text-blue-500"
                      : "border-emerald-500 text-emerald-500"
                  }
                >
                  {profile.role}
                </Badge>
                {profile.isOnline && (
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              {profile.bio && (
                <p className="text-sm mt-2">{profile.bio}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-blue-500"
                  >
                    <GlobeIcon className="h-3 w-3" />
                    Website
                  </a>
                )}
                {profile.github && (
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <GithubIcon className="h-3 w-3" />
                    {profile.github}
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <LinkedinIcon className="h-3 w-3" />
                    {profile.linkedin}
                  </a>
                )}
              </div>
            </div>
            {isOwnProfile && (
              <Dialog open={showEdit} onOpenChange={(open) => {
                setShowEdit(open);
                if (open) {
                  setEditForm({
                    bio: profile.bio || "",
                    location: profile.location || "",
                    website: profile.website || "",
                    github: profile.github || "",
                    linkedin: profile.linkedin || "",
                    skills: profile.skills?.join(", ") || "",
                  });
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-12">
                    <EditIcon className="h-3.5 w-3.5 mr-1" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 mt-3">
                    <div>
                      <Label>Bio</Label>
                      <textarea
                        className="w-full h-16 bg-muted/40 rounded-md p-2 text-sm resize-none border focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Tell us about yourself..."
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Location</Label>
                        <Input
                          placeholder="San Francisco, CA"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Website</Label>
                        <Input
                          placeholder="https://yoursite.com"
                          value={editForm.website}
                          onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>GitHub Username</Label>
                        <Input
                          placeholder="octocat"
                          value={editForm.github}
                          onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>LinkedIn Username</Label>
                        <Input
                          placeholder="johndoe"
                          value={editForm.linkedin}
                          onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Skills (comma-separated)</Label>
                      <Input
                        placeholder="React, Node.js, Python, AWS"
                        value={editForm.skills}
                        onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleSaveProfile} className="w-full">
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <ZapIcon className="h-6 w-6 mx-auto mb-1 text-amber-500" />
            <p className="text-2xl font-bold">{xp}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrophyIcon className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
            <p className="text-2xl font-bold">Level {level}</p>
            <div className="w-full bg-muted rounded-full h-1.5 mt-1">
              <div
                className="bg-yellow-500 h-1.5 rounded-full transition-all"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {xp % 100}/{100} XP to next
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FlameIcon className="h-6 w-6 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold">{profile.streak || 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CodeIcon className="h-6 w-6 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold">{profile.questionsCompleted || 0}</p>
            <p className="text-xs text-muted-foreground">Problems Solved</p>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      {profile.badges && profile.badges.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AwardIcon className="h-5 w-5 text-purple-500" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge) => {
                const info = BADGE_INFO[badge] || {
                  label: badge,
                  icon: "🏅",
                  color: "bg-gray-500/15 text-gray-500",
                };
                return (
                  <div
                    key={badge}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${info.color}`}
                  >
                    <span>{info.icon}</span>
                    {info.label}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Submissions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-emerald-500" />
            Recent Submissions
            <div className="ml-auto flex items-center gap-3 text-xs font-normal text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2Icon className="h-3 w-3 text-emerald-500" />
                {successCount} passed
              </span>
              <span className="flex items-center gap-1">
                <XCircleIcon className="h-3 w-3 text-red-500" />
                {errorCount} failed
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            {submissions === undefined ? (
              <Loader2Icon className="h-6 w-6 animate-spin mx-auto" />
            ) : submissions.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No submissions yet
              </p>
            ) : (
              <div className="space-y-2">
                {submissions.slice(0, 30).map((sub) => (
                  <div
                    key={sub._id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/40 transition-colors"
                  >
                    {sub.status === "success" ? (
                      <CheckCircle2Icon className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {sub.questionTitle}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {sub.language} • {format(new Date(sub._creationTime), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <Badge
                      variant={sub.status === "success" ? "default" : "destructive"}
                      className="text-[10px]"
                    >
                      {sub.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;
