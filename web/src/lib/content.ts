import defaultSiteData from "../../content/site-data.json";
import { readContentOverride } from "./kv";
import type { SiteData } from "./types";

export async function getSiteData(): Promise<SiteData> {
  const override = await readContentOverride<SiteData>();
  return override ?? (defaultSiteData as SiteData);
}

export function getDefaultSiteData(): SiteData {
  return defaultSiteData as SiteData;
}
