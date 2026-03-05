import { db } from "@/db";
import { clicks } from "@/db/schema";
import type { ClickMetadata } from "@/lib/parse-headers";

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
