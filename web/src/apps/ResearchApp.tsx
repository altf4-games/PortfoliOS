"use client";

import { useSiteData } from "@/lib/useSiteData";
import { AppBody, Empty, ExtIcon, Skeleton } from "./ui";

const KIND_LABEL = { paper: "Paper", copyright: "Copyright", other: "Work" } as const;

export default function ResearchApp() {
  const site = useSiteData();
  if (!site) {
    return (
      <AppBody>
        <Skeleton lines={2} />
      </AppBody>
    );
  }
  return (
    <AppBody className="space-y-3">
      {site.publications.length === 0 && <Empty>No publications yet.</Empty>}
      {site.publications.map((pub) => (
        <article key={pub.id} className="ui-card p-4">
          <span className="ui-chip">{KIND_LABEL[pub.kind]}</span>
          <h3 className="ui-heading text-[15px] mt-2 leading-snug">{pub.title}</h3>
          <p className="text-[13px] ui-accent mt-1">{pub.venue}</p>
          {pub.detail && <p className="text-[12px] ui-muted mt-1">{pub.detail}</p>}
          {pub.url && (
            <a href={pub.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs ui-accent mt-2 hover:underline">
              Read <ExtIcon />
            </a>
          )}
        </article>
      ))}
      {site.profile.orcidUrl && (
        <a href={site.profile.orcidUrl} target="_blank" rel="noreferrer" className="ui-btn">
          ORCID profile <ExtIcon />
        </a>
      )}
    </AppBody>
  );
}
