import { useEffect, useState } from "react";
import type { SiteData } from "./types";

export function useSiteData() {
  const [data, setData] = useState<SiteData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content")
      .then((r) => r.json())
      .then((d: SiteData) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
