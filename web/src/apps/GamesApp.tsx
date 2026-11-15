"use client";

import { useState } from "react";
import { useSiteData } from "@/lib/useSiteData";
import { useFetch } from "@/lib/useFetch";
import type { ItchGame } from "@/lib/types";
import { ItchIcon, SteamIcon } from "@/components/os/icons";
import { AppBody, Section, Skeleton, Stats } from "./ui";

const STEAM_HEADER = "https://cdn.akamai.steamstatic.com/steam/apps/4539460/header.jpg";

export default function GamesApp() {
  const site = useSiteData();
  const { data: games } = useFetch<ItchGame[]>("/api/games");
  const [genre, setGenre] = useState<string>("All");

  const genres = ["All", ...Array.from(new Set((games ?? []).map((g) => g.genre).filter(Boolean) as string[]))];
  const shown = (games ?? []).filter((g) => genre === "All" || g.genre === genre);

  return (
    <AppBody className="space-y-6">
      {/* Steam release hero */}
      <a
        href={site?.profile.steamUrl}
        target="_blank"
        rel="noreferrer"
        className="ui-card block overflow-hidden"
      >
        <div className="aspect-[460/215] bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={STEAM_HEADER} alt="Fragments of Fear" className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-[12px] ui-muted">
            <SteamIcon className="w-3.5 h-3.5" /> Out now on Steam
          </div>
          <h2 className="text-[17px] ui-heading mt-1">Fragments of Fear</h2>
          <p className="text-[13px] ui-muted mt-1">A VHS found-footage horror anthology where everyday chores become your worst nightmares.</p>
        </div>
      </a>

      <Stats
        items={[
          ["200K+", "downloads"],
          [games ? games.length + 1 : "…", "games shipped"],
          ["2", "game jam wins"],
        ]}
      />
      <p className="text-[12px] ui-muted -mt-2">Played on channels including Markiplier and Jacksepticeye.</p>

      <Section
        title="On itch.io"
        right={
          site && (
            <a href={site.profile.itchUrl} target="_blank" rel="noreferrer" className="text-xs ui-accent inline-flex items-center gap-1 hover:underline">
              <ItchIcon className="w-3.5 h-3.5" /> Profile
            </a>
          )
        }
      >
        <div className="flex flex-wrap gap-1.5">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className="ui-chip cursor-pointer"
              style={genre === g ? { background: "var(--ui-fg)", color: "var(--ui-app-bg, #000)" } : undefined}
            >
              {g}
            </button>
          ))}
        </div>
        {!games && <Skeleton lines={2} />}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {shown.map((g) => (
            <a key={g.url} href={g.url} target="_blank" rel="noreferrer" className="ui-card overflow-hidden block">
              <div className="aspect-[315/250] bg-black/40 overflow-hidden">
                {g.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.cover} alt="" loading="lazy" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-2.5">
                <div className="text-[13px] font-semibold leading-tight line-clamp-1">{g.title}</div>
                <div className="text-[11px] ui-muted mt-0.5 line-clamp-2 min-h-[2.4em]">{g.description ?? g.genre}</div>
              </div>
            </a>
          ))}
        </div>
      </Section>
    </AppBody>
  );
}
