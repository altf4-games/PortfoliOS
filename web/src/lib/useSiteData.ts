import type { SiteData } from "./types";
import { useFetch } from "./useFetch";

export function useSiteData(): SiteData | null {
  return useFetch<SiteData>("/api/content").data;
}
