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
}

export interface HackathonEntry {
  id: string;
  title: string;
  result: string;
  date: string;
  url?: string;
}

export interface CustomProject {
  id: string;
  name: string;
  description: string;
  html_url: string;
  language?: string;
  homepage?: string;
}

export interface SiteData {
  profile: {
    name: string;
    whoami: string;
    about: string;
    hostname: string;
    resumeUrl: string;
    githubUsername: string;
    linkedinUrl: string;
    githubUrl: string;
    itchUrl: string;
    steamUrl: string;
  };
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  techStack: Record<string, string>;
  achievements: string[];
  hackathons: HackathonEntry[];
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
