import fallbackRepos from "../../content/github-fallback.json";
import type { GithubRepo } from "./types";

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
