import { Hono } from "hono";

import { authMiddleware } from "../../middlewares/auth";

const app = new Hono().use(authMiddleware).get("/", async (c) => {
  const { lists } = await c.var.api.lists.list();

  // Read-only Linkwarden-compatible endpoint for v0.1-alpha.
  // Fields id, name, parentId chosen based on known Linkwarden API structure.
  // Only manual lists are exposed; smart lists are excluded.
  // Covered by packages/e2e_tests/tests/api/linkwarden-collections.test.ts.
  // Full Linkwarden/Floccus response contract not yet verified against a live client.
  const collections = lists
    .filter((list) => list.type === "manual")
    .map((list) => ({
      id: list.id,
      name: list.name,
      parentId: list.parentId,
    }));

  return c.json({ collections }, 200);
});

export default app;
