import fallbackGames from "../../content/itch-fallback.json";
import type { ItchGame } from "./types";

// itch.io has no keyless public API for listing a creator's games, so this reads the
// public creator page (the same HTML a visitor sees) and pulls out each game cell.
// The markup has been stable for years, but if itch ever changes it the parser returns
// nothing and the committed snapshot is used instead.

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function parseItchPage(html: string): ItchGame[] {
  const cells = html.split(/class="game_cell[ "]/).slice(1);
  const games: ItchGame[] = [];
  for (const c of cells) {
    const title = c.match(/class="title game_link"[^>]*>([^<]+)</)?.[1];
    const url = c.match(/href="(https:\/\/[^"]+\.itch\.io\/[^"]+)"/)?.[1];
    if (!title || !url) continue;
    const desc = c.match(/class="game_text"[^>]*title="([^"]*)"/)?.[1] ?? null;
    const genre = c.match(/class="game_genre">([^<]*)</)?.[1] ?? null;
    const cover = c.match(/data-lazy_src="([^"]+)"/)?.[1] ?? null;
    games.push({
      title: decode(title.trim()),
      url,
      description: desc ? decode(desc) : null,
      genre,
      cover,
    });
  }
  return games;
}

export async function fetchItchGames(itchUrl: string): Promise<ItchGame[]> {
  try {
    const res = await fetch(itchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (PortfoliOS)" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`itch returned ${res.status}`);
    const games = parseItchPage(await res.text());
    if (games.length === 0) throw new Error("no games parsed");
    return games;
  } catch {
    return fallbackGames as ItchGame[];
  }
}
