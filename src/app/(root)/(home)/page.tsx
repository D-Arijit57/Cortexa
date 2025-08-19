"use client";

import ActionCard from "@/components/ActionCard";
import { QUICK_ACTIONS } from "@/constants";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "convex/react";
import { useState, useEffect } from "react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import MeetingModal from "@/components/MeetingModal";
import LoaderUI from "@/components/LoaderUI";
import { Loader2Icon } from "lucide-react";
import MeetingCard from "@/components/MeetingCard";

export default function Home() {
  const router = useRouter();

  const { isInterviewer, isCandidate, isLoading } = useUserRole();
  const interviews = useQuery(api.interviews.getMyInterviews);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">();

  // Debug logging
  console.log("Home Page - isLoading:", isLoading);
  console.log("Home Page - isInterviewer:", isInterviewer);
  console.log("Home Page - isCandidate:", isCandidate);

  // Redirect to onboarding if no role is set
  useEffect(() => {
    if (!isLoading && !isInterviewer && !isCandidate) {
      console.log("Redirecting to onboarding - no role set");
      router.push("/onboarding");
    }
  }, [isLoading, isInterviewer, isCandidate, router]);

  // Redirect interviewers to schedule page
  useEffect(() => {
    if (!isLoading && isInterviewer) {
      console.log("Redirecting interviewer to schedule page");
      router.push("/schedule");
    }
  }, [isLoading, isInterviewer, router]);

  const handleQuickAction = (title: string) => {
    switch (title) {
      case "New Call":
        setModalType("start");
        setShowModal(true);
        break;
      case "Join Interview":
        setModalType("join");
        setShowModal(true);
        break;
      case "Schedule":
        router.push("/schedule");
        break;
      case "Recordings":
        router.push("/recordings");
        break;
      default:
        router.push(`/${title.toLowerCase()}`);
    }
  };

  if (isLoading) return <LoaderUI />;

  // Show loading while redirecting interviewers
  if (isInterviewer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-lg font-medium">Redirecting to Interviewer Portal...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if no role is set
  if (!isInterviewer && !isCandidate) {
    return <LoaderUI />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container max-w-7xl mx-auto p-6">
        {/* CANDIDATE SECTION */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Welcome to Cortexa
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent mb-6">
            Candidate Portal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Prepare for your interviews with confidence and ease
          </p>
        </div>

        {/* QUICK ACTIONS FOR CANDIDATES */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {QUICK_ACTIONS.filter(action => 
            action.title === "New Call" || action.title === "Join Interview"
          ).map((action) => (
            <ActionCard
              key={action.title}
              action={action}
              onClick={() => handleQuickAction(action.title)}
            />
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Your Interviews</h2>
              <p className="text-muted-foreground">View and join your scheduled interviews</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Active</span>
            </div>
          </div>

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
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No interviews scheduled</h3>
              <p className="text-muted-foreground">You'll see your upcoming interviews here once they're scheduled.</p>
            </div>
          )}
        </div>

        <MeetingModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
          isJoinMeeting={modalType === "join"}
        />
      </div>
    </div>
  );
}
