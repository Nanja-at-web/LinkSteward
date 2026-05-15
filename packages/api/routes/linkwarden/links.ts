import { and, eq, notLike } from "drizzle-orm";
import { Hono } from "hono";

import {
  bookmarkLinks,
  bookmarkLists,
  bookmarks,
  bookmarksInLists,
  bookmarkTags,
  tagsOnBookmarks,
} from "@karakeep/db/schema";

import { authMiddleware } from "../../middlewares/auth";

// Read-only Linkwarden-compatible endpoint for v0.1-alpha.
// Response shape (id, name, url, description, tags, collection, createdAt, updatedAt)
// is based on known Linkwarden API structure but not yet verified against a live
// Floccus Linkwarden-mode client. See docs/docs/linksteward/analysis/floccus-compatibility-analysis-v0.1.md.

const EXCLUDED_URL_PREFIXES = [
  "javascript:",
  "data:",
  "chrome:",
  "chrome-extension:",
  "about:",
  "file:",
  "moz-extension:",
  "edge:",
] as const;

const app = new Hono().use(authMiddleware).get("/", async (c) => {
  const userId = c.var.ctx.user.id;
  const db = c.var.ctx.db;

  const rows = await db
    .select({
      bookmarkId: bookmarks.id,
      bookmarkCreatedAt: bookmarks.createdAt,
      bookmarkModifiedAt: bookmarks.modifiedAt,
      bookmarkTitle: bookmarks.title,
      linkUrl: bookmarkLinks.url,
      linkTitle: bookmarkLinks.title,
      linkDescription: bookmarkLinks.description,
      tagId: bookmarkTags.id,
      tagName: bookmarkTags.name,
      tagAttachedBy: tagsOnBookmarks.attachedBy,
      listId: bookmarkLists.id,
      listName: bookmarkLists.name,
    })
    .from(bookmarkLinks)
    .innerJoin(
      bookmarks,
      and(eq(bookmarks.id, bookmarkLinks.id), eq(bookmarks.userId, userId)),
    )
    .leftJoin(tagsOnBookmarks, eq(tagsOnBookmarks.bookmarkId, bookmarks.id))
    .leftJoin(bookmarkTags, eq(bookmarkTags.id, tagsOnBookmarks.tagId))
    .leftJoin(bookmarksInLists, eq(bookmarksInLists.bookmarkId, bookmarks.id))
    .leftJoin(
      bookmarkLists,
      and(
        eq(bookmarkLists.id, bookmarksInLists.listId),
        eq(bookmarkLists.type, "manual"),
      ),
    )
    .where(
      and(
        ...EXCLUDED_URL_PREFIXES.map((prefix) =>
          notLike(bookmarkLinks.url, `${prefix}%`),
        ),
      ),
    );

  interface LinkItem {
    id: string;
    name: string;
    url: string;
    description: string | null;
    tags: { id: string; name: string }[];
    collection: { id: string; name: string } | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }

  const itemMap = new Map<string, LinkItem>();

  for (const row of rows) {
    let item = itemMap.get(row.bookmarkId);
    if (!item) {
      item = {
        id: row.bookmarkId,
        name: row.bookmarkTitle ?? row.linkTitle ?? "",
        url: row.linkUrl,
        description: row.linkDescription,
        tags: [],
        collection: null,
        createdAt: row.bookmarkCreatedAt,
        updatedAt: row.bookmarkModifiedAt,
      };
      itemMap.set(row.bookmarkId, item);
    }

    if (row.tagId && row.tagName && row.tagAttachedBy === "human") {
      if (!item.tags.some((t) => t.id === row.tagId)) {
        item.tags.push({ id: row.tagId!, name: row.tagName! });
      }
    }

    if (row.listId && row.listName && item.collection === null) {
      item.collection = { id: row.listId, name: row.listName };
    }
  }

  return c.json({ response: Array.from(itemMap.values()) }, 200);
});

export default app;
