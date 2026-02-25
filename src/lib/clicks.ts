import { db } from "@/db";
import { clicks } from "@/db/schema";

interface ClickMetadata {
  referrer: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
}

export function recordClick(linkId: string, metadata: ClickMetadata): void {
  db.insert(clicks)
    .values({
      linkId,
      referrer: metadata.referrer,
      country: metadata.country,
      device: metadata.device,
      browser: metadata.browser,
    })
    .catch(() => {
      // Fire-and-forget: swallow errors so the redirect is never blocked
    });
}
