"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  PlusIcon,
  UsersIcon,
  HashIcon,
  GlobeIcon,
  LockIcon,
  SearchIcon,
  SparklesIcon,
  ArrowRightIcon,
  Loader2Icon,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const SPACE_CATEGORIES = [
  "All",
  "Frontend",
  "Backend",
  "Full Stack",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Mobile",
  "System Design",
  "Algorithms",
  "Career",
  "General",
];

const SPACE_ICONS = ["💻", "🚀", "⚡", "🎯", "🧠", "🔥", "💡", "🌟", "🎨", "🏗️", "📚", "🔧"];

function SpacesPage() {
  const publicSpaces = useQuery(api.spaces.getPublicSpaces);
  const mySpaces = useQuery(api.spaces.getMySpaces);
  const createSpace = useMutation(api.spaces.create);
  const joinSpace = useMutation(api.spaces.join);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [newSpace, setNewSpace] = useState({
    name: "",
    description: "",
    category: "General",
    icon: "💻",
    isPublic: true,
    tags: "",
  });

  const filteredSpaces = (publicSpaces ?? []).filter((space) => {
    const matchesSearch =
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || space.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const mySpaceIds = new Set((mySpaces ?? []).map((s) => s._id));

  const handleCreateSpace = async () => {
    if (!newSpace.name.trim() || !newSpace.description.trim()) {
      toast.error("Name and description are required");
      return;
    }
    try {
      await createSpace({
        name: newSpace.name,
        description: newSpace.description,
        category: newSpace.category,
        icon: newSpace.icon,
        isPublic: newSpace.isPublic,
        tags: newSpace.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      toast.success("Space created!");
      setShowCreate(false);
      setNewSpace({
        name: "",
        description: "",
        category: "General",
        icon: "💻",
        isPublic: true,
        tags: "",
      });
    } catch {
      toast.error("Failed to create space");
    }
  };

  const handleJoinSpace = async (spaceId: typeof publicSpaces extends (infer T)[] | undefined ? T extends { _id: infer I } ? I : never : never) => {
    try {
      await joinSpace({ spaceId });
      toast.success("Joined space!");
    } catch {
      toast.error("Failed to join space");
    }
  };

  if (publicSpaces === undefined) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
            Spaces
          </h1>
          <p className="text-muted-foreground mt-1">
            Join communities, discuss topics, and grow together
          </p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-linear-to-r from-violet-600 to-indigo-500 text-white">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Space
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create a New Space</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <Select
                  value={newSpace.icon}
                  onValueChange={(v) => setNewSpace({ ...newSpace, icon: v })}
                >
                  <SelectTrigger className="w-16 h-12 text-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPACE_ICONS.map((icon) => (
                      <SelectItem key={icon} value={icon} className="text-xl">
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1">
                  <Label>Space Name</Label>
                  <Input
                    placeholder="e.g., React Developers"
                    value={newSpace.name}
                    onChange={(e) =>
                      setNewSpace({ ...newSpace, name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  className="w-full h-20 bg-muted/40 rounded-md p-2 text-sm resize-none border focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="What's this space about?"
                  value={newSpace.description}
                  onChange={(e) =>
                    setNewSpace({ ...newSpace, description: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label>Category</Label>
                  <Select
                    value={newSpace.category}
                    onValueChange={(v) =>
                      setNewSpace({ ...newSpace, category: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPACE_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Visibility</Label>
                  <Select
                    value={newSpace.isPublic ? "public" : "private"}
                    onValueChange={(v) =>
                      setNewSpace({ ...newSpace, isPublic: v === "public" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <span className="flex items-center gap-1">
                          <GlobeIcon className="h-3 w-3" /> Public
                        </span>
                      </SelectItem>
                      <SelectItem value="private">
                        <span className="flex items-center gap-1">
                          <LockIcon className="h-3 w-3" /> Private
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  placeholder="react, javascript, frontend"
                  value={newSpace.tags}
                  onChange={(e) =>
                    setNewSpace({ ...newSpace, tags: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleCreateSpace} className="w-full">
                <SparklesIcon className="h-4 w-4 mr-2" />
                Create Space
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Spaces */}
      {mySpaces && mySpaces.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Your Spaces</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mySpaces.map((space) => (
              <Link key={space._id} href={`/spaces/${space._id}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer border-violet-500/20 hover:border-violet-500/50 h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{space.icon || "💻"}</span>
                      <CardTitle className="text-base line-clamp-1">
                        {space.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {space.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UsersIcon className="h-3 w-3" />
                      {space.memberCount} members
                      <Badge variant="outline" className="text-[10px] ml-auto">
                        {space.category}
                      </Badge>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search spaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SPACE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Discover Spaces */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Discover Spaces</h2>
        <ScrollArea className="h-[calc(100vh-28rem)]">
          {filteredSpaces.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {filteredSpaces.map((space) => (
                <Card
                  key={space._id}
                  className="hover:shadow-lg transition-all"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{space.icon || "💻"}</span>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-1">
                          {space.name}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {space.isPublic ? (
                            <GlobeIcon className="h-3 w-3" />
                          ) : (
                            <LockIcon className="h-3 w-3" />
                          )}
                          {space.isPublic ? "Public" : "Private"}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {space.description}
                    </p>
                    {space.tags && space.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {space.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <UsersIcon className="h-3 w-3" />
                      {space.memberCount}
                    </div>
                    {mySpaceIds.has(space._id) ? (
                      <Link href={`/spaces/${space._id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Open
                          <ArrowRightIcon className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={() => handleJoinSpace(space._id)}
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Join
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <HashIcon className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No spaces found</p>
              <p className="text-sm">Be the first to create a space!</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

export default SpacesPage;
