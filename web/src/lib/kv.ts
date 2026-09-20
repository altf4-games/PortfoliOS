import { Redis } from "@upstash/redis";

const CONTENT_KEY = "portfolios:site-data";

let client: Redis | null = null;

function getClient(): Redis | null {
  if (client) return client;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  client = new Redis({ url, token });
  return client;
}

export async function readContentOverride<T>(): Promise<T | null> {
  const redis = getClient();
  if (!redis) return null;
  const data = await redis.get<T>(CONTENT_KEY);
  return data ?? null;
}

export async function writeContentOverride<T>(data: T): Promise<void> {
  const redis = getClient();
  if (!redis) {
    throw new Error(
      "KV is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN (Upstash) to enable saving from /admin."
    );
  }
  await redis.set(CONTENT_KEY, data);
}

export function isKvConfigured(): boolean {
  return getClient() !== null;
}
