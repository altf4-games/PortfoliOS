export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  period: string;
  detail?: string;
}

export interface ExperienceEntry {
  id: string;
  role: string;
  org: string;
  period: string;
  location?: string;
  bullets?: string[];
}

export interface HackathonEntry {
  id: string;
  title: string;
  result: string;
  date: string;
  url?: string;
  // true = an outright win, false = a placement short of winning (finalist, top N, etc.).
  // Drives which icon/color the entry gets on the Trophies window.
  isWinner: boolean;
}

// Manually-entered PRs. Merged PRs are now pulled from GitHub automatically (see
// lib/github.ts fetchMergedPrs); these are only extras GitHub search can't find.
export interface OssContribution {
  id: string;
  repo: string; // e.g. "microsoft/data-formulator"
  repoUrl: string;
  prNumber: string; // e.g. "351"
  prUrl: string;
}

export interface CustomProject {
  id: string;
  name: string;
  description: string;
  html_url: string;
  language?: string;
  homepage?: string;
}

// Hand-written project write-ups shown above the GitHub grid in the Projects app.
export interface CaseStudy {
  id: string;
  name: string;
  tagline: string;
  tech: string[];
  bullets: string[];
  award?: string;
  url?: string;
  repoUrl?: string;
}

export interface Publication {
  id: string;
  kind: "paper" | "copyright" | "other";
  title: string;
  venue: string;
  detail?: string;
  url?: string;
}

export interface SiteData {
  profile: {
    name: string;
    whoami: string;
    about: string;
    tagline: string;
    location: string;
    currently: string;
    hostname: string;
    resumeUrl: string;
    githubUsername: string;
    avatarUrl: string;
    linkedinUrl: string;
    githubUrl: string;
    itchUrl: string;
    steamUrl: string;
    portfolioUrl: string;
    orcidUrl: string;
    email: string;
    leetcodeUsername: string;
    codechefUsername: string;
    codeforcesUsername: string;
  };
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  techStack: Record<string, string>;
  achievements: string[];
  hackathons: HackathonEntry[];
  oss: OssContribution[];
  // PR URLs hidden from the auto-fetched list, and whole repos to skip.
  ossHidden: string[];
  ossExcludedRepos: string[];
  caseStudies: CaseStudy[];
  publications: Publication[];
  projectOverrides: {
    included: string[];
    featured: string[];
    custom: CustomProject[];
  };
}

export interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork: boolean;
  homepage: string | null;
  pinned?: boolean;
}

export interface MergedPr {
  repo: string;
  repoUrl: string;
  repoStars: number | null;
  ownerAvatar: string | null;
  number: number;
  title: string;
  url: string;
  mergedAt: string | null;
  additions: number | null;
  deletions: number | null;
}

export interface ItchGame {
  title: string;
  url: string;
  description: string | null;
  genre: string | null;
  cover: string | null;
}

export interface CodingStats {
  github: {
    publicRepos: number;
    followers: number;
    totalStars: number;
    contributions: { total: number; weeks: { days: { date: string; count: number }[] }[] } | null;
  } | null;
  leetcode: { total: number; easy: number; medium: number; hard: number; rating: number | null; topPercentage: number | null } | null;
  codechef: { rating: number | null; highest: number | null; stars: number | null } | null;
  codeforces: { rating: number | null; maxRating: number | null; rank: string | null } | null;
}
