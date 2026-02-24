import { Clock, Code2, Calendar, Users } from "lucide-react";

export const INTERVIEW_CATEGORY = [
  { id: "upcoming", title: "Upcoming Interviews", variant: "outline" },
  { id: "completed", title: "Completed", variant: "secondary" },
  { id: "succeeded", title: "Succeeded", variant: "default" },
  { id: "failed", title: "Failed", variant: "destructive" },
] as const;

export const TIME_SLOTS = [
  "09:00",
  "09:15",
  "09:30",
  "09:45",

  "10:00",
  "10:15",
  "10:30",
  "10:45",

  "11:00",
  "11:15",
  "11:30",
  "11:45",

  "12:00",
  "12:15",
  "12:30",
  "12:45",

  "13:00",
  "13:15",
  "13:30",
  "13:45",

  "14:00",
  "14:15",
  "14:30",
  "14:45",

  "15:00",
  "15:15",
  "15:30",
  "15:45",

  "16:00",
  "16:15",
  "16:30",
  "16:45",

  "17:00",
  "17:15",
  "17:30",
  "17:45",

  "18:00",
  "18:15",
  "18:30",
  "18:45",

  "19:00",
  "19:15",
  "19:30",
  "19:45",

  "20:00",
];

export const QUICK_ACTIONS = [
  {
    icon: Code2,
    title: "New Call",
    description: "Start an instant call",
    color: "primary",
    gradient: "from-primary/10 via-primary/5 to-transparent",
  },
  {
    icon: Users,
    title: "Join Interview",
    description: "Enter via invitation link",
    color: "purple-500",
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
  },
  {
    icon: Calendar,
    title: "Schedule",
    description: "Plan upcoming interviews",
    color: "blue-500",
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
  },
  {
    icon: Clock,
    title: "Recordings",
    description: "Access past interviews",
    color: "orange-500",
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
  },
];

export type QuickActionType = (typeof QUICK_ACTIONS)[number];