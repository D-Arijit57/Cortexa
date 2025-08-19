"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [role, setRole] = useState<"candidate" | "interviewer" | "">("");
  const [isSaving, setIsSaving] = useState(false);

  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const createUserWithRoleMutation = useMutation(api.users.createUserWithRole);

  useEffect(() => {
    if (userData?.role) {
      setRole(userData.role);
      // If user already has a role, redirect them
      if (userData.role === "interviewer") {
        router.push("/schedule");
      } else if (userData.role === "candidate") {
        router.push("/");
      }
    }
  }, [userData?.role, router]);

  const save = async () => {
    if (!role || !user) return;
    
    setIsSaving(true);
    try {
      console.log("Setting role to:", role);
      console.log("User ID:", user.id);
      console.log("User email:", user.emailAddresses[0]?.emailAddress);
      console.log("User name:", user.fullName);
      
      // Use the simplified mutation
      const result = await createUserWithRoleMutation({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        fullName: user.fullName || "",
        image: user.imageUrl,
        role: role,
      });
      
      console.log("Mutation result:", result);
      
      // Show success message
      toast.success(`Role set to ${role}! Redirecting...`);
      
      // Wait a moment for the database to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Force a page refresh to ensure the role is updated
      window.location.href = role === "interviewer" ? "/schedule" : "/";
      
    } catch (error) {
      console.error("Error setting role:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes("Unauthorized")) {
          toast.error("Authentication failed. Please log in again.");
        } else if (error.message.includes("validation")) {
          toast.error("Invalid data provided. Please check your information.");
        } else {
          toast.error(`Failed to set role: ${error.message}`);
        }
      } else {
        toast.error("Failed to set role. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Debug info
  console.log("Onboarding - isUserLoaded:", isUserLoaded);
  console.log("Onboarding - User:", user?.id);
  console.log("Onboarding - User data:", userData);
  console.log("Onboarding - Current role state:", role);
  console.log("Onboarding - Should show role selection:", !userData?.role);
  console.log("Onboarding - userData is null:", userData === null);
  console.log("Onboarding - userData is undefined:", userData === undefined);

  // Show loading while user is not loaded
  if (!isUserLoaded) {
    return (
      <div className="container mx-auto max-w-lg py-10">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2Icon className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading user...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while checking user data
  if (userData === undefined) {
    return (
      <div className="container mx-auto max-w-lg py-10">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2Icon className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading user data...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user already has a role and we're redirecting, show loading
  if (userData?.role && (userData.role === "interviewer" || userData.role === "candidate")) {
    return (
      <div className="container mx-auto max-w-lg py-10">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2Icon className="h-6 w-6 animate-spin" />
            <span className="ml-2">Redirecting to your dashboard...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Welcome to Cortexa!
            </CardTitle>
            <p className="text-muted-foreground">Choose your role to get started with your interview journey</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <Button 
                variant={role === "candidate" ? "default" : "outline"} 
                onClick={() => setRole("candidate")}
                className={`h-24 text-left p-4 transition-all duration-200 ${
                  role === "candidate" 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg scale-105" 
                    : "hover:scale-105 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    role === "candidate" ? "bg-white/20" : "bg-blue-100 dark:bg-blue-900/20"
                  }`}>
                    <svg className={`w-6 h-6 ${role === "candidate" ? "text-white" : "text-blue-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Candidate</div>
                    <div className="text-sm opacity-80">I want to be interviewed</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant={role === "interviewer" ? "default" : "outline"} 
                onClick={() => setRole("interviewer")}
                className={`h-24 text-left p-4 transition-all duration-200 ${
                  role === "interviewer" 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg scale-105" 
                    : "hover:scale-105 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    role === "interviewer" ? "bg-white/20" : "bg-emerald-100 dark:bg-emerald-900/20"
                  }`}>
                    <svg className={`w-6 h-6 ${role === "interviewer" ? "text-white" : "text-emerald-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Interviewer</div>
                    <div className="text-sm opacity-80">I want to conduct interviews</div>
                  </div>
                </div>
              </Button>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button 
                onClick={save} 
                disabled={!role || isSaving}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-2"
              >
                {isSaving ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Setting up your account...
                  </>
                ) : (
                  "Get Started"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
