import { customAlphabet } from "nanoid";
import { eq, count, desc } from "drizzle-orm";
import { db } from "@/db";
import { links, clicks } from "@/db/schema";

const generateCode = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  7
);

type Link = typeof links.$inferSelect;

const MAX_RETRIES = 3;

export async function createLink(
  originalUrl: string
): Promise<{ data: Link } | { error: string; message: string }> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const id = crypto.randomUUID();
    const shortCode = generateCode();

    try {
      const [link] = await db
        .insert(links)
        .values({ id, shortCode, originalUrl })
        .returning();
      return { data: link };
    } catch (err) {
      const isConstraintError =
        err instanceof Error &&
        err.message.includes("UNIQUE constraint failed");
      if (!isConstraintError || attempt === MAX_RETRIES - 1) {
        return { error: "CREATE_FAILED", message: "Failed to create link." };
      }
    }
  }

  return { error: "CREATE_FAILED", message: "Failed to create link." };
}

export async function getLinkByCode(
  shortCode: string
): Promise<{ data: Link } | { error: string; message: string }> {
  try {
    const link = await db.query.links.findFirst({
      where: eq(links.shortCode, shortCode),
    });
    if (!link) {
      return { error: "NOT_FOUND", message: "Short link not found." };
    }
    return { data: link };
  } catch {
    return { error: "QUERY_FAILED", message: "Failed to look up link." };
  }
}

export async function getLinks(
  page: number,
  limit: number
): Promise<
  | {
      data: {
        links: (Link & { totalClicks: number })[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    }
  | { error: string; message: string }
> {
  try {
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        id: links.id,
        shortCode: links.shortCode,
        originalUrl: links.originalUrl,
        createdAt: links.createdAt,
        totalClicks: count(clicks.id),
      })
      .from(links)
      .leftJoin(clicks, eq(links.id, clicks.linkId))
      .groupBy(links.id)
      .orderBy(desc(links.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db
      .select({ total: count() })
      .from(links);

    return {
      data: {
        links: rows.map((row) => ({
          ...row,
          totalClicks: Number(row.totalClicks),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch {
    return { error: "QUERY_FAILED", message: "Failed to list links." };
  }
}
