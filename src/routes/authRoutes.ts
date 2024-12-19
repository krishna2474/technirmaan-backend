import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";

export const authRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

authRouter.post("/event", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const body = await c.req.json();
    const res = await prisma.event.create({
      data: {
        name: body.name,
        description: body.description,
      },
    });
    return c.json(res);
  } catch (e: any) {
    return c.json({ error: e.message });
  }
});

authRouter.get("/event/:eventId", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const param = c.req.param("eventId");
    const res = await prisma.event.findUnique({
      where: {
        event_id: param,
      },
    });
    return c.json({ name: res?.name });
  } catch (e: any) {
    return c.json({ error: e.message });
  }
});
