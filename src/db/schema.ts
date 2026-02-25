import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const links = sqliteTable(
  "links",
  {
    id: text("id").primaryKey(),
    shortCode: text("short_code").notNull(),
    originalUrl: text("original_url").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex("idx_links_short_code").on(table.shortCode)]
);

export const clicks = sqliteTable(
  "clicks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    linkId: text("link_id")
      .notNull()
      .references(() => links.id),
    clickedAt: integer("clicked_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    referrer: text("referrer"),
    country: text("country"),
    device: text("device"),
    browser: text("browser"),
  },
  (table) => [
    index("idx_clicks_link_id").on(table.linkId),
    index("idx_clicks_link_date").on(table.linkId, table.clickedAt),
    index("idx_clicks_link_referrer").on(table.linkId, table.referrer),
    index("idx_clicks_link_country").on(table.linkId, table.country),
  ]
);
