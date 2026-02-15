"use client";


import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useState } from 'react';
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import  useGetCallById  from "@/hooks/useGetCallById";
import LoaderUI from "@/components/LoaderUI";
import MeetingSetup from "@/components/MeetingSetup";
import MeetingRoom from "@/components/MeetingRoom";

function MeetingPage() {

    const { id } = useParams();
    const { isLoaded } = useUser();
    const { call, isCallLoading } = useGetCallById(id as string);
    
    const [isSetupComplete, setIsSetupComplete] = useState(false);

    if (!isLoaded || isCallLoading) return <LoaderUI />;

    if(!call){
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-2xl font-semibold">Meeting not found</p>
            </div>
        )
    }
    return (
        <StreamCall call={call}>
            <StreamTheme>
                {!isSetupComplete ? (
                    <MeetingSetup onSetupComplete={() => setIsSetupComplete(true)} />
                ):(
                    <MeetingRoom meetingId={id as string} />
                )}
            </StreamTheme>
        </StreamCall>
    )
}

export default MeetingPage;