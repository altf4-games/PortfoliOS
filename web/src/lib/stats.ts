import type { CodingStats } from "./types";

// Each source is optional and independent: a missing username or a failed request just
// leaves that card out of the Stats app instead of failing the whole response.

export async function fetchLeetcode(username: string): Promise<CodingStats["leetcode"]> {
  if (!username) return null;
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: "https://leetcode.com", "User-Agent": "Mozilla/5.0" },
      body: JSON.stringify({
        query: `query($u:String!){matchedUser(username:$u){submitStatsGlobal{acSubmissionNum{difficulty count}}} userContestRanking(username:$u){rating topPercentage}}`,
        variables: { u: username },
      }),
      next: { revalidate: 21600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const nums = json.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum as
      | { difficulty: string; count: number }[]
      | undefined;
    if (!nums) return null;
    const get = (d: string) => nums.find((n) => n.difficulty === d)?.count ?? 0;
    const ranking = json.data?.userContestRanking;
    return {
      total: get("All"),
      easy: get("Easy"),
      medium: get("Medium"),
      hard: get("Hard"),
      rating: ranking?.rating ? Math.round(ranking.rating) : null,
      topPercentage: ranking?.topPercentage ?? null,
    };
  } catch {
    return null;
  }
}

export async function fetchCodechef(username: string): Promise<CodingStats["codechef"]> {
  if (!username) return null;
  try {
    const res = await fetch(`https://www.codechef.com/users/${encodeURIComponent(username)}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 21600 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const rating = html.match(/class="rating-number">\s*(\d+)/)?.[1];
    const highest = html.match(/Highest Rating (\d+)/)?.[1];
    const starBlock = html.match(/class="rating-star">([\s\S]*?)<\/div>/)?.[1] ?? "";
    const stars = (starBlock.match(/&#9733;|★/g) ?? []).length;
    return {
      rating: rating ? Number(rating) : null,
      highest: highest ? Number(highest) : null,
      stars: stars || null,
    };
  } catch {
    return null;
  }
}

export async function fetchCodeforces(username: string): Promise<CodingStats["codeforces"]> {
  if (!username) return null;
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`, {
      next: { revalidate: 21600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const u = json.result?.[0];
    if (!u) return null;
    return { rating: u.rating ?? null, maxRating: u.maxRating ?? null, rank: u.rank ?? null };
  } catch {
    return null;
  }
}
