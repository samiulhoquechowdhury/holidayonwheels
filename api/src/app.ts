import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./env";
import { pingDb } from "./db/client";
import { attachSession } from "./middleware/session";
import { errorHandler, notFoundHandler } from "./middleware/errors";
import { asyncHandler } from "./lib/http";
import { contentRouter } from "./routes/content";
import { bookingsRouter } from "./routes/bookings";
import { usersRouter } from "./routes/users";
import { officeRouter } from "./routes/office";
import { accountRouter } from "./routes/account";

/**
 * The API, as an Express app — built but not listening.
 *
 * Mounted under `/api/v1`. The version is in the path from the start because
 * the Next.js app and the admin UI are deployed separately from this service:
 * a breaking change has to be able to run alongside the old shape while the
 * frontend catches up, and retrofitting a version prefix later means
 * rewriting every call site at once.
 *
 * ## Why this is separate from `index.ts`
 *
 * `index.ts` used to build the app *and* call `app.listen` at module scope,
 * so importing it to test a route bound port 4000 — which failed outright
 * when the dev server already held it, and when it did not, left a listening
 * socket open after the tests finished. Construction and process startup are
 * different jobs: this file does the first, `index.ts` does the second, and
 * the tests import this one.
 */
export function createApp() {
  const app = express();

  /**
   * `trust proxy` is off in development and on behind a load balancer.
   *
   * It decides whether `req.ip` and `req.protocol` come from
   * `X-Forwarded-For`/`-Proto` or from the socket. Guessing either way is
   * wrong: trusting the header when nothing strips it lets any client claim any
   * IP, which would poison the audit log; not trusting it behind a proxy
   * records the proxy's own address on every row. So it follows NODE_ENV, and
   * the audit log's `ip_address` is only as trustworthy as this setting.
   */
  app.set("trust proxy", env.NODE_ENV === "production" ? 1 : false);

  app.use(
    pinoHttp({
      level: env.LOG_LEVEL,
      /*
       * Cookies and Authorization carry the session token, which is a bearer
       * credential: logged, it is a logged password. Redacted at the logger so
       * no individual log call has to remember.
       */
      redact: {
        paths: [
          "req.headers.cookie",
          "req.headers.authorization",
          'res.headers["set-cookie"]',
        ],
        censor: "[redacted]",
      },
    }),
  );

  app.use(helmet());

  app.use(
    cors({
      /*
       * An explicit allow-list, and `credentials: true`. The browser sends the
       * session cookie on these requests, so `origin: "*"` is both rejected by
       * browsers alongside credentials and — if it were not — an invitation for
       * any site to read a signed-in admin's data.
       */
      origin(origin, callback) {
        /* No Origin header: curl, a health check, a server-to-server call. */
        if (!origin) return callback(null, true);
        if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} is not allowed.`));
      },
      credentials: true,
    }),
  );

  /*
   * 1 MB. The default is 100 KB, which a tour with a nineteen-day itinerary
   * exceeds; no body here should approach a megabyte, and uploads do not come
   * through this parser.
   */
  app.use(express.json({ limit: "1mb" }));

  app.use(attachSession);

  /* --- Health ---------------------------------------------------------- */

  /**
   * Liveness and readiness in one, deliberately.
   *
   * It queries the database rather than returning a constant. An API that
   * reports healthy while its only dependency is unreachable tells a load
   * balancer to keep sending traffic that cannot be served.
   */
  app.get(
    "/api/v1/health",
    asyncHandler(async (_req, res) => {
      const dbOk = await pingDb();
      res.status(dbOk ? 200 : 503).json({
        status: dbOk ? "ok" : "degraded",
        database: dbOk ? "up" : "down",
        uptimeSeconds: Math.round(process.uptime()),
      });
    }),
  );

  /** Who the caller is, for the admin shell to render a name and a role. */
  app.get("/api/v1/me", (req, res) => {
    res.json({ data: req.user ?? null });
  });

  /* --- Resources ------------------------------------------------------- */

  app.use("/api/v1", contentRouter);
  app.use("/api/v1/bookings", bookingsRouter);
  app.use("/api/v1/users", usersRouter);
  app.use("/api/v1/account", accountRouter);
  /*
   * Mounted last of the four, and at the root of the version prefix, because
   * its paths (`/enquiries`, `/trip-requests`, `/dashboard`) do not collide
   * with the content resources above. A resource added to `contentRouter` with
   * one of those names would shadow it, which is why they are listed here.
   */
  app.use("/api/v1", officeRouter);

  /* --- Tail ------------------------------------------------------------ */

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
