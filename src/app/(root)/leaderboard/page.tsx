"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TrophyIcon,
  FlameIcon,
  Medal,
  CrownIcon,
  Loader2Icon,
  ZapIcon,
  CodeIcon,
  AwardIcon,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const RANK_STYLES = [
  {
    bg: "bg-gradient-to-r from-yellow-500/20 to-amber-500/10",
    border: "border-yellow-500/30",
    icon: <CrownIcon className="h-5 w-5 text-yellow-500" />,
    label: "text-yellow-500",
  },
  {
    bg: "bg-gradient-to-r from-gray-300/20 to-gray-400/10",
    border: "border-gray-400/30",
    icon: <Medal className="h-5 w-5 text-gray-400" />,
    label: "text-gray-400",
  },
  {
    bg: "bg-gradient-to-r from-amber-700/20 to-orange-800/10",
    border: "border-amber-700/30",
    icon: <Medal className="h-5 w-5 text-amber-700" />,
    label: "text-amber-700",
  },
];

function LeaderboardPage() {
  const { user: clerkUser } = useUser();
  const leaderboard = useQuery(api.codeSubmissions.getLeaderboard);

  if (leaderboard === undefined) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const myRank =
    leaderboard.findIndex((u) => u.clerkId === clerkUser?.id) + 1 || null;

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-linear-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Top coders ranked by XP and performance
        </p>
        {myRank && (
          <Badge variant="outline" className="mt-2 text-sm">
            Your rank: #{myRank}
          </Badge>
        )}
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 items-end">
          {/* 2nd place */}
          <Card className={`${RANK_STYLES[1].bg} border ${RANK_STYLES[1].border}`}>
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-2">{RANK_STYLES[1].icon}</div>
              <Avatar className="h-14 w-14 mx-auto mb-2 border-2 border-gray-400">
                <AvatarImage src={leaderboard[1].image} />
                <AvatarFallback>{leaderboard[1].name[0]}</AvatarFallback>
              </Avatar>
              <p className="font-semibold text-sm truncate">{leaderboard[1].name}</p>
              <p className={`text-xs font-bold ${RANK_STYLES[1].label}`}>
                {leaderboard[1].xp} XP
              </p>
              <p className="text-[10px] text-muted-foreground">
                Level {leaderboard[1].level}
              </p>
            </CardContent>
          </Card>

          {/* 1st place */}
          <Card className={`${RANK_STYLES[0].bg} border ${RANK_STYLES[0].border} -mt-4`}>
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-2">{RANK_STYLES[0].icon}</div>
              <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-yellow-500">
                <AvatarImage src={leaderboard[0].image} />
                <AvatarFallback>{leaderboard[0].name[0]}</AvatarFallback>
              </Avatar>
              <p className="font-bold text-sm truncate">{leaderboard[0].name}</p>
              <p className={`text-sm font-bold ${RANK_STYLES[0].label}`}>
                {leaderboard[0].xp} XP
              </p>
              <p className="text-[10px] text-muted-foreground">
                Level {leaderboard[0].level}
              </p>
            </CardContent>
          </Card>

          {/* 3rd place */}
          <Card className={`${RANK_STYLES[2].bg} border ${RANK_STYLES[2].border}`}>
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-2">{RANK_STYLES[2].icon}</div>
              <Avatar className="h-14 w-14 mx-auto mb-2 border-2 border-amber-700">
                <AvatarImage src={leaderboard[2].image} />
                <AvatarFallback>{leaderboard[2].name[0]}</AvatarFallback>
              </Avatar>
              <p className="font-semibold text-sm truncate">{leaderboard[2].name}</p>
              <p className={`text-xs font-bold ${RANK_STYLES[2].label}`}>
                {leaderboard[2].xp} XP
              </p>
              <p className="text-[10px] text-muted-foreground">
                Level {leaderboard[2].level}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-yellow-500" />
            Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-32rem)]">
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-1">#</div>
                <div className="col-span-4">User</div>
                <div className="col-span-2 text-center">Level</div>
                <div className="col-span-2 text-center">XP</div>
                <div className="col-span-1 text-center">
                  <FlameIcon className="h-3 w-3 mx-auto" />
                </div>
                <div className="col-span-2 text-center">Solved</div>
              </div>

              {leaderboard.map((user, index) => {
                const isMe = user.clerkId === clerkUser?.id;
                return (
                  <Link key={user.clerkId} href={`/profile/${user.clerkId}`}>
                    <div
                      className={`grid grid-cols-12 gap-2 px-3 py-2.5 rounded-md items-center transition-colors hover:bg-muted/50 ${
                        isMe ? "bg-primary/5 border border-primary/20" : ""
                      }`}
                    >
                      <div className="col-span-1">
                        <span
                          className={`text-sm font-bold ${
                            index < 3 ? RANK_STYLES[index]?.label : "text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="text-[10px]">
                            {user.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">
                          {user.name}
                          {isMe && (
                            <Badge variant="outline" className="text-[8px] ml-1 px-1 py-0">
                              You
                            </Badge>
                          )}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <Badge variant="secondary" className="text-[10px]">
                          Lv.{user.level}
                        </Badge>
                      </div>
                      <div className="col-span-2 text-center text-sm font-semibold flex items-center justify-center gap-1">
                        <ZapIcon className="h-3 w-3 text-amber-500" />
                        {user.xp}
                      </div>
                      <div className="col-span-1 text-center text-sm">
                        {user.streak > 0 && (
                          <span className="text-orange-500 font-semibold">
                            {user.streak}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2 text-center text-sm flex items-center justify-center gap-1">
                        <CodeIcon className="h-3 w-3 text-blue-500" />
                        {user.questionsCompleted}
                      </div>
                    </div>
                  </Link>
                );
              })}

              {leaderboard.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <AwardIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No data yet. Start solving problems!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default LeaderboardPage;
