import { useUser } from "@clerk/nextjs";
import { useQuery  } from "convex/react";
import { api } from "../../convex/_generated/api";




export const useUserRole = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const userData = useQuery(
        api.users.getUserByClerkId,
        isLoaded && isSignedIn && user?.id
            ? { clerkId: user.id }
            : "skip"
    );

    const isLoading = !isLoaded || userData === undefined;

    return {
        isLoading,
        isInterviewer: userData?.role === "interviewer",
        
    }
}