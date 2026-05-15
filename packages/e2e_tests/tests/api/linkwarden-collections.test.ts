import { beforeEach, describe, expect, inject, it } from "vitest";

import { createKarakeepClient } from "@karakeep/sdk";

import { createTestUser } from "../../utils/api";

describe("Linkwarden Collections API (GET /api/v1/collections)", () => {
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
    const response = await fetch(`http://localhost:${port}/api/v1/collections`);
    expect(response.status).toBe(401);
  });

  it("should return 200 with a valid Bearer API key", async () => {
    const response = await fetch(
      `http://localhost:${port}/api/v1/collections`,
      {
        headers: { authorization: `Bearer ${apiKey}` },
      },
    );
    expect(response.status).toBe(200);
  });

  it("should return a body with a 'collections' array", async () => {
    const response = await fetch(
      `http://localhost:${port}/api/v1/collections`,
      {
        headers: { authorization: `Bearer ${apiKey}` },
      },
    );
    const body = (await response.json()) as { collections: unknown };
    expect(Array.isArray(body.collections)).toBe(true);
  });

  it("should include manual lists in collections", async () => {
    const { data: list1 } = await client.POST("/lists", {
      body: { name: "Manual List A", icon: "📁" },
    });
    const { data: list2 } = await client.POST("/lists", {
      body: { name: "Manual List B", icon: "📂" },
    });

    const response = await fetch(
      `http://localhost:${port}/api/v1/collections`,
      {
        headers: { authorization: `Bearer ${apiKey}` },
      },
    );
    const body = (await response.json()) as { collections: { id: string }[] };
    const ids = body.collections.map((c) => c.id);

    expect(ids).toContain(list1!.id);
    expect(ids).toContain(list2!.id);
  });

  it("should exclude smart lists from collections", async () => {
    const { data: smartList } = await client.POST("/lists", {
      body: { name: "Smart List", icon: "⚡", type: "smart", query: "is:fav" },
    });

    const response = await fetch(
      `http://localhost:${port}/api/v1/collections`,
      {
        headers: { authorization: `Bearer ${apiKey}` },
      },
    );
    const body = (await response.json()) as { collections: { id: string }[] };
    const ids = body.collections.map((c) => c.id);

    expect(ids).not.toContain(smartList!.id);
  });

  it("each collection element should have id, name, and parentId", async () => {
    await client.POST("/lists", {
      body: { name: "Shape Test List", icon: "🔍" },
    });

    const response = await fetch(
      `http://localhost:${port}/api/v1/collections`,
      {
        headers: { authorization: `Bearer ${apiKey}` },
      },
    );
    const body = (await response.json()) as {
      collections: Record<string, unknown>[];
    };

    expect(body.collections.length).toBeGreaterThanOrEqual(1);
    for (const collection of body.collections) {
      expect(collection).toHaveProperty("id");
      expect(collection).toHaveProperty("name");
      expect(collection).toHaveProperty("parentId");
    }
  });

  it("parentId should be null or a string, never undefined", async () => {
    // Create a list without a parent → parentId expected to be null
    await client.POST("/lists", {
      body: { name: "Parent Check List", icon: "🧩" },
    });

    const response = await fetch(
      `http://localhost:${port}/api/v1/collections`,
      {
        headers: { authorization: `Bearer ${apiKey}` },
      },
    );
    const body = (await response.json()) as {
      collections: { parentId: unknown }[];
    };

    for (const collection of body.collections) {
      expect(
        collection.parentId === null || typeof collection.parentId === "string",
      ).toBe(true);
    }
  });
});
