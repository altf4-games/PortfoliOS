import defaultSiteData from "../../content/site-data.json";
import { readContentOverride } from "./kv";
import type { SiteData } from "./types";

const DEFAULTS = defaultSiteData as SiteData;

// KV can hold data saved before a field existed (e.g. it predates the excluded->included
// rename, or itchUrl/steamUrl being added), so a saved override is merged over the
// content/site-data.json defaults field-by-field rather than replacing them wholesale --
// anything missing from the saved data falls back to the .json file instead of crashing.
function mergeWithDefaults(override: Partial<SiteData> | null): SiteData {
  if (!override) return DEFAULTS;
  return {
    profile: { ...DEFAULTS.profile, ...override.profile },
    education: override.education ?? DEFAULTS.education,
    experience: override.experience ?? DEFAULTS.experience,
    skills: override.skills ?? DEFAULTS.skills,
    techStack: override.techStack ?? DEFAULTS.techStack,
    achievements: override.achievements ?? DEFAULTS.achievements,
    hackathons: override.hackathons ?? DEFAULTS.hackathons,
    oss: override.oss ?? DEFAULTS.oss,
    projectOverrides: { ...DEFAULTS.projectOverrides, ...override.projectOverrides },
  };
}

export async function getSiteData(): Promise<SiteData> {
  const override = await readContentOverride<Partial<SiteData>>();
  return mergeWithDefaults(override);
}

export function getDefaultSiteData(): SiteData {
  return DEFAULTS;
}
