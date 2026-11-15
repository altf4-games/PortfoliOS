import fallbackRepos from "../../content/github-fallback.json";
import fallbackPrs from "../../content/github-prs-fallback.json";
import type { GithubRepo, MergedPr } from "./types";

const PINNED_QUERY = `
  query PinnedRepos($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: [REPOSITORY]) {
        nodes {
          ... on Repository {
            name
            description
            url
            homepageUrl
            primaryLanguage { name }
            stargazerCount
            forkCount
            isFork
            updatedAt
          }
        }
      }
    }
  }
`;

interface GraphQLPinnedResponse {
  data?: {
    user: {
      pinnedItems: {
        nodes: Array<{
          name: string;
          description: string | null;
          url: string;
          homepageUrl: string | null;
          primaryLanguage: { name: string } | null;
          stargazerCount: number;
          forkCount: number;
          isFork: boolean;
          updatedAt: string;
        }>;
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
}

export async function fetchPinnedRepos(username: string): Promise<GithubRepo[]> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return fallbackRepos as GithubRepo[];
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: PINNED_QUERY, variables: { login: username } }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`GitHub GraphQL returned ${res.status}`);

    const json = (await res.json()) as GraphQLPinnedResponse;
    const nodes = json.data?.user?.pinnedItems.nodes;
    if (!nodes || nodes.length === 0) throw new Error("No pinned repos returned");

    return nodes.map((n) => ({
      name: n.name,
      description: n.description,
      html_url: n.url,
      language: n.primaryLanguage?.name ?? null,
      stargazers_count: n.stargazerCount,
      forks_count: n.forkCount,
      updated_at: n.updatedAt,
      fork: n.isFork,
      homepage: n.homepageUrl,
      pinned: true,
    }));
  } catch {
    return fallbackRepos as GithubRepo[];
  }
}

// ---------------------------------------------------------------------------
// Merged pull requests to other people's repos, pulled straight from GitHub so the
// Open Source app never needs manual entry. GraphQL (with GITHUB_TOKEN) gives repo stars
// and line counts; without a token it falls back to the unauthenticated REST search API,
// and if both fail, to a committed snapshot.
// ---------------------------------------------------------------------------


const PR_SEARCH_QUERY = `
  query MergedPrs($q: String!) {
    search(query: $q, type: ISSUE, first: 100) {
      nodes {
        ... on PullRequest {
          number
          title
          url
          mergedAt
          additions
          deletions
          repository {
            nameWithOwner
            url
            stargazerCount
            owner { avatarUrl }
          }
        }
      }
    }
  }
`;

interface GraphQLPrNode {
  number: number;
  title: string;
  url: string;
  mergedAt: string | null;
  additions: number;
  deletions: number;
  repository: { nameWithOwner: string; url: string; stargazerCount: number; owner: { avatarUrl: string } };
}

interface RestSearchItem {
  number: number;
  title: string;
  html_url: string;
  repository_url: string;
  pull_request?: { merged_at: string | null };
}

export async function fetchMergedPrs(username: string): Promise<MergedPr[]> {
  const q = `author:${username} is:pr is:merged -user:${username}`;
  const token = process.env.GITHUB_TOKEN;

  try {
    if (token) {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: PR_SEARCH_QUERY, variables: { q } }),
        next: { revalidate: 3600 },
      });
      if (!res.ok) throw new Error(`GitHub GraphQL returned ${res.status}`);
      const json = (await res.json()) as { data?: { search: { nodes: GraphQLPrNode[] } } };
      const nodes = json.data?.search.nodes?.filter((n) => n && n.repository);
      if (!nodes) throw new Error("No search results");
      return sortPrs(
        nodes.map((n) => ({
          repo: n.repository.nameWithOwner,
          repoUrl: n.repository.url,
          repoStars: n.repository.stargazerCount,
          ownerAvatar: n.repository.owner.avatarUrl,
          number: n.number,
          title: n.title,
          url: n.url,
          mergedAt: n.mergedAt,
          additions: n.additions,
          deletions: n.deletions,
        }))
      );
    }

    const res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=100`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`GitHub REST search returned ${res.status}`);
    const json = (await res.json()) as { items: RestSearchItem[] };
    return sortPrs(
      json.items.map((i) => {
        const repo = i.repository_url.split("/repos/")[1];
        return {
          repo,
          repoUrl: `https://github.com/${repo}`,
          repoStars: null,
          ownerAvatar: `https://github.com/${repo.split("/")[0]}.png?size=64`,
          number: i.number,
          title: i.title,
          url: i.html_url,
          mergedAt: i.pull_request?.merged_at ?? null,
          additions: null,
          deletions: null,
        };
      })
    );
  } catch {
    return fallbackPrs as MergedPr[];
  }
}

function sortPrs(prs: MergedPr[]): MergedPr[] {
  return prs.sort((a, b) => (b.mergedAt ?? "").localeCompare(a.mergedAt ?? ""));
}

// ---------------------------------------------------------------------------
// Profile stats for the Stats app.
// ---------------------------------------------------------------------------

const CONTRIB_QUERY = `
  query Contrib($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }
`;

export async function fetchGithubStats(username: string) {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { next: { revalidate: 3600 } }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=owner`, { next: { revalidate: 3600 } }),
    ]);
    if (!userRes.ok) throw new Error("user fetch failed");
    const user = (await userRes.json()) as { public_repos: number; followers: number };
    const repos = reposRes.ok ? ((await reposRes.json()) as { stargazers_count: number; fork: boolean }[]) : [];
    const totalStars = repos.filter((r) => !r.fork).reduce((sum, r) => sum + r.stargazers_count, 0);

    let contributions = null;
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: CONTRIB_QUERY, variables: { login: username } }),
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const json = await res.json();
        const cal = json.data?.user?.contributionsCollection?.contributionCalendar;
        if (cal) {
          contributions = {
            total: cal.totalContributions as number,
            weeks: (cal.weeks as { contributionDays: { date: string; contributionCount: number }[] }[]).map((w) => ({
              days: w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })),
            })),
          };
        }
      }
    }

    return { publicRepos: user.public_repos, followers: user.followers, totalStars, contributions };
  } catch {
    return null;
  }
}
