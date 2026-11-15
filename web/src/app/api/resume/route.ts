import { NextResponse } from "next/server";
import { getSiteData } from "@/lib/content";

export const revalidate = 3600;

// The admin-configured resume URL may be a direct link, a Google Drive link, or a
// redirector that responds with the real URL as plain text (code-snip's /raw/ endpoint
// does this). Resolve it to something embeddable plus a direct download link.
async function resolve(url: string): Promise<string> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const type = res.headers.get("content-type") ?? "";
    if (type.startsWith("text/plain")) {
      const body = (await res.text()).trim();
      if (/^https?:\/\/\S+$/.test(body)) return body;
    }
    return res.url || url;
  } catch {
    return url;
  }
}

export async function GET() {
  const { profile } = await getSiteData();
  const resolved = await resolve(profile.resumeUrl);
  const driveId = resolved.match(/drive\.google\.com\/file\/d\/([^/?#]+)/)?.[1];

  if (driveId) {
    return NextResponse.json({
      viewUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${driveId}`,
      openUrl: `https://drive.google.com/file/d/${driveId}/view`,
    });
  }
  return NextResponse.json({ viewUrl: resolved, downloadUrl: resolved, openUrl: resolved });
}
