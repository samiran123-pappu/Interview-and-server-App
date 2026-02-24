"use client";

import LoaderUI from "@/components/LoaderUI";
import { useViewMode } from "@/hooks/useViewMode";
import { useRouter } from "next/navigation";
import InterviewScheduleUI from "./InterviewScheduleUI";

function SchedulePage() {
  const router = useRouter();
  const { isInterviewerView, hasChosenMode } = useViewMode();

  if (!hasChosenMode) return router.push("/");
  if (!isInterviewerView) return router.push("/");

  return <InterviewScheduleUI />;
}
export default SchedulePage;