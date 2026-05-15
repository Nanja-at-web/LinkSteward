import { beforeEach, describe, expect, inject, it } from "vitest";

import { createKarakeepClient } from "@karakeep/sdk";

import { createTestUser } from "../../utils/api";

describe("Linkwarden Links API (GET /api/v1/links)", () => {
  const port = inject("karakeepPort");

  if (!port) {
    throw new Error("Missing required environment variables");
  }

  let client: ReturnType<typeof createKarakeepClient>;
  let apiKey: string;

  beforeEach(async () => {
    apiKey = await createTestUser();
    client = createKarakeepClient({
      baseUrl: `http://localhost:${port}/api/v1/`,
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
    });
  });

  it("should return 401 without an Authorization header", async () => {
    const response = await fetch(`http://localhost:${port}/api/v1/links`);
    expect(response.status).toBe(401);
  });

  it("should return 200 with a valid Bearer API key and no bookmarks", async () => {
    const response = await fetch(`http://localhost:${port}/api/v1/links`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    expect(response.status).toBe(200);
  });

  it("should return a body with a 'response' array", async () => {
    const response = await fetch(`http://localhost:${port}/api/v1/links`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const body = (await response.json()) as { response: unknown };
    expect(Array.isArray(body.response)).toBe(true);
  });

  it("should include link bookmarks in response", async () => {
    const { data: bookmark } = await client.POST("/bookmarks", {
      body: {
        type: "link",
        url: "https://example.com/linksteward-link-test",
        title: "Test Link Bookmark",
      },
    });

    const response = await fetch(`http://localhost:${port}/api/v1/links`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const body = (await response.json()) as { response: { id: string }[] };
    const ids = body.response.map((item) => item.id);
    expect(ids).toContain(bookmark!.id);
  });

  it("should not include text bookmarks in response", async () => {
    const { data: textBookmark } = await client.POST("/bookmarks", {
      body: {
        type: "text",
        title: "Plain Text Note",
        text: "This is a plain text note, not a link",
      },
    });

    const response = await fetch(`http://localhost:${port}/api/v1/links`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const body = (await response.json()) as { response: { id: string }[] };
    const ids = body.response.map((item) => item.id);
    expect(ids).not.toContain(textBookmark!.id);
  });

  it("each link element should have id, name, url, and tags as array", async () => {
    await client.POST("/bookmarks", {
      body: {
        type: "link",
        url: "https://example.com/linksteward-shape-test",
        title: "Shape Test Link",
      },
    });

    const response = await fetch(`http://localhost:${port}/api/v1/links`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const body = (await response.json()) as {
      response: Record<string, unknown>[];
    };

    expect(body.response.length).toBeGreaterThanOrEqual(1);
    for (const item of body.response) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("url");
      expect(Array.isArray(item.tags)).toBe(true);
    }
  });

  it("should include human-attached tags in the tags array", async () => {
    const { data: bookmark } = await client.POST("/bookmarks", {
      body: {
        type: "link",
        url: "https://example.com/linksteward-human-tag-test",
        title: "Human Tag Test",
      },
    });

    await client.POST("/bookmarks/{bookmarkId}/tags", {
      params: { path: { bookmarkId: bookmark!.id } },
      body: { tags: [{ tagName: "human-tag", attachedBy: "human" }] },
    });

    const response = await fetch(`http://localhost:${port}/api/v1/links`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const body = (await response.json()) as {
      response: { id: string; tags: { id: string; name: string }[] }[];
    };
    const found = body.response.find((item) => item.id === bookmark!.id);
    expect(found).toBeDefined();
    const tagNames = found!.tags.map((t) => t.name);
    expect(tagNames).toContain("human-tag");
  });

  it("should not include AI-attached tags in the tags array", async () => {
    const { data: bookmark } = await client.POST("/bookmarks", {
      body: {
        type: "link",
        url: "https://example.com/linksteward-ai-tag-test",
        title: "AI Tag Filter Test",
      },
    });

    await client.POST("/bookmarks/{bookmarkId}/tags", {
      params: { path: { bookmarkId: bookmark!.id } },
      body: {
        tags: [
          { tagName: "ai-generated-tag", attachedBy: "ai" },
          { tagName: "user-tag", attachedBy: "human" },
        ],
      },
    });

    const response = await fetch(`http://localhost:${port}/api/v1/links`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const body = (await response.json()) as {
      response: { id: string; tags: { id: string; name: string }[] }[];
    };
    const found = body.response.find((item) => item.id === bookmark!.id);
    expect(found).toBeDefined();
    const tagNames = found!.tags.map((t) => t.name);
    expect(tagNames).not.toContain("ai-generated-tag");
    expect(tagNames).toContain("user-tag");
  });

  it("collection should be set when bookmark is in a manual list", async () => {
    const { data: bookmark } = await client.POST("/bookmarks", {
      body: {
        type: "link",
        url: "https://example.com/linksteward-collection-test",
        title: "Collection Test Link",
      },
    });

    const { data: list } = await client.POST("/lists", {
      body: { name: "Linkwarden Test Collection", icon: "📁" },
    });

    await client.PUT("/lists/{listId}/bookmarks/{bookmarkId}", {
      params: {
        path: { listId: list!.id, bookmarkId: bookmark!.id },
      },
    });

    const response = await fetch(`http://localhost:${port}/api/v1/links`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const body = (await response.json()) as {
      response: {
        id: string;
        collection: { id: string; name: string } | null;
      }[];
    };
    const found = body.response.find((item) => item.id === bookmark!.id);
    expect(found).toBeDefined();
    expect(found!.collection).not.toBeNull();
    expect(found!.collection!.id).toBe(list!.id);
    expect(found!.collection!.name).toBe("Linkwarden Test Collection");
  });

  it("collection should be null when bookmark is not in any list", async () => {
    const { data: bookmark } = await client.POST("/bookmarks", {
      body: {
        type: "link",
        url: "https://example.com/linksteward-no-collection-test",
        title: "No Collection Test",
      },
    });

    const response = await fetch(`http://localhost:${port}/api/v1/links`, {
      headers: { authorization: `Bearer ${apiKey}` },
    });
    const body = (await response.json()) as {
      response: { id: string; collection: unknown }[];
    };
    const found = body.response.find((item) => item.id === bookmark!.id);
    expect(found).toBeDefined();
    expect(found!.collection).toBeNull();
  });

  // TODO: Test that bookmarks with excluded URL schemes (javascript:, data:, chrome:,
  // chrome-extension:, about:, file:, moz-extension:, edge:) do not appear in the response.
  // Not implemented here because it is unclear whether the bookmark creation API accepts
  // these URL schemes. Needs investigation before a safe E2E assertion can be written.
});
