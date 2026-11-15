import { useEffect, useState } from "react";

// Many apps read the same endpoints (/api/content especially). One in-flight request and
// one cached value per URL keeps a dozen open windows from each refetching on mount.
const values = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export function fetchCached<T>(url: string): Promise<T> {
  if (values.has(url)) return Promise.resolve(values.get(url) as T);
  let p = inflight.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`${url} returned ${r.status}`);
        return r.json();
      })
      .then((v) => {
        values.set(url, v);
        return v;
      })
      .finally(() => inflight.delete(url));
    inflight.set(url, p);
  }
  return p as Promise<T>;
}

export function useFetch<T>(url: string): { data: T | null; error: boolean } {
  const [state, setState] = useState<{ data: T | null; error: boolean }>(() => ({
    data: (values.get(url) as T) ?? null,
    error: false,
  }));

  useEffect(() => {
    if (values.has(url)) return;
    let cancelled = false;
    fetchCached<T>(url)
      .then((data) => !cancelled && setState({ data, error: false }))
      .catch(() => !cancelled && setState({ data: null, error: true }));
    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
