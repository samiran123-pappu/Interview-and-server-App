"use client"

import { SignedIn, UserButton, useUser } from "@clerk/nextjs"
import {
  CodeIcon,
  HomeIcon,
  HashIcon,
  MessageSquareIcon,
  NewspaperIcon,
  TrophyIcon,
  UserIcon,
  FilmIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "./ModeToggle"
import DashboardBtn from "./DashboardBtn"
import NotificationBell from "./NotificationBell"

const NAV_LINKS = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/spaces", icon: HashIcon, label: "Spaces" },
  { href: "/feed", icon: NewspaperIcon, label: "Feed" },
  { href: "/messages", icon: MessageSquareIcon, label: "Messages" },
  { href: "/vidsnap", icon: FilmIcon, label: "VidSnap" },
  { href: "/leaderboard", icon: TrophyIcon, label: "Leaderboard" },
]

function Navbar() {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 items-center px-4 container mx-auto gap-1">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-xl mr-4 font-mono hover:opacity-80 transition-opacity shrink-0"
        >
          <CodeIcon className="size-7 text-emerald-500" />
          <span className="bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent hidden sm:inline">
            CodeInterview
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right Side */}
        <SignedIn>
          <div className="flex items-center gap-2 ml-auto">
            <DashboardBtn />
            <NotificationBell />
            {user && (
              <Link
                href={`/profile/${user.id}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <UserIcon className="h-4 w-4" />
              </Link>
            )}
            <ModeToggle />
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </nav>
  )
}

export default Navbar