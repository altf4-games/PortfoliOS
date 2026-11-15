"use client";

import { useState } from "react";
import { useFetch } from "@/lib/useFetch";
import { useAppStore } from "@/store/useAppStore";
import { ExtIcon } from "./ui";

interface ResumeLinks {
  viewUrl: string;
  downloadUrl: string;
  openUrl: string;
}

export default function ResumeApp() {
  const { data } = useFetch<ResumeLinks>("/api/resume");
  const theme = useAppStore((s) => s.theme);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="ui-app h-full flex flex-col">
      <div
        className={`flex items-center gap-2 px-3 py-2 shrink-0 ${theme === "retro" ? "" : "border-b"}`}
        style={{ borderColor: "var(--ui-border)" }}
      >
        <span className="text-[13px] font-medium flex-1 truncate">Pradyum_Mistry_Resume.pdf</span>
        {data && (
          <>
            <a href={data.downloadUrl} target="_blank" rel="noreferrer" className="ui-btn !py-1 !px-3 !text-xs">
              Download
            </a>
            <a href={data.openUrl} target="_blank" rel="noreferrer" className="ui-btn !py-1 !px-3 !text-xs">
              Open <ExtIcon />
            </a>
          </>
        )}
      </div>
      <div className={`relative flex-1 min-h-0 ${theme === "retro" ? "bevel-in m-1 bg-white" : "bg-[#525659]"}`}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-sm ui-muted">
            <span className="animate-pulse">Loading resume…</span>
          </div>
        )}
        {data && (
          <iframe
            src={data.viewUrl}
            title="Resume"
            className="absolute inset-0 w-full h-full border-0"
            onLoad={() => setLoaded(true)}
            allow="autoplay"
          />
        )}
      </div>
    </div>
  );
}
