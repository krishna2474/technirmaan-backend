import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRouter } from "./routes/authRoutes";
import { verifyRouter } from "./routes/verifyRoutes";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();
app.use("*", cors());
app.route("/api/v1/auth", authRouter);
app.route("/api/v1/verify", verifyRouter);

export default app;
