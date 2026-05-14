import { Hono } from "hono";

import { authMiddleware } from "../../middlewares/auth";

const app = new Hono().use(authMiddleware).get("/", async (c) => {
  const { lists } = await c.var.api.lists.list();

  // Alpha-minimal Linkwarden-compatible shape. The exact Floccus/Linkwarden
  // response contract still needs verification against a real client.
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
