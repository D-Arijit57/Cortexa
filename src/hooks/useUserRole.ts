import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useUserRole = () => {
  const { user, isLoaded: isUserLoaded } = useUser();

  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const isLoading = !isUserLoaded || userData === undefined;

  // Debug logging
  console.log("useUserRole - isUserLoaded:", isUserLoaded);
  console.log("useUserRole - User ID:", user?.id);
  console.log("useUserRole - User Data:", userData);
  console.log("useUserRole - Role:", userData?.role);
  console.log("useUserRole - isInterviewer:", userData?.role === "interviewer");
  console.log("useUserRole - isLoading:", isLoading);

  return {
    isLoading,
    isInterviewer: userData?.role === "interviewer",
    isCandidate: userData?.role === "candidate",
  };
};
