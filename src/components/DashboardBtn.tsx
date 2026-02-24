"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { SparklesIcon } from "lucide-react"
import { useViewMode } from "@/hooks/useViewMode";

function DashboardBtn() {
    const { isInterviewerView } = useViewMode();

    if (!isInterviewerView) return null;
  return (
    <Link href={"/dashboard"}>
        <Button className="gap-2 font-medium" size={"sm"}>
            <SparklesIcon className="size-4"/>
            Dashboard
        </Button>
    </Link>
  )
}

export default DashboardBtn