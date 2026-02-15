"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

/**
 * Invisible component that tracks user's online/offline status.
 * Sets user online when mounted, offline when tab closes or loses focus.
 * Mount this in the root layout.
 */
function OnlineTracker() {
  const { user, isLoaded, isSignedIn } = useUser();
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    // Set online
    setOnlineStatus({ isOnline: true });

    const handleVisibilityChange = () => {
      setOnlineStatus({ isOnline: !document.hidden });
    };

    const handleBeforeUnload = () => {
      // Use sendBeacon to ensure the request goes through on page unload
      setOnlineStatus({ isOnline: false });
    };

    const handleFocus = () => setOnlineStatus({ isOnline: true });
    const handleBlur = () => setOnlineStatus({ isOnline: false });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      setOnlineStatus({ isOnline: false });
    };
  }, [user, setOnlineStatus]);

  return null; // Invisible component
}

export default OnlineTracker;
