import { env } from "./env";
import { pool } from "./db/client";
import { createApp } from "./app";

/**
 * The API process: build the app, listen, and shut down cleanly.
 *
 * Nothing is constructed here. `createApp` owns the middleware and the
 * routes; this file owns the socket and the signal handlers, which is what
 * makes the app importable by a test without a port being taken.
 */
const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(
    `[api] listening on http://localhost:${env.PORT}/api/v1 ` +
      `(${env.NODE_ENV}, cors: ${env.CORS_ORIGINS.join(", ")})`,
  );
});

/**
 * Report a failure to bind, loudly.
 *
 * Without this, a port already in use produces an `error` event with no
 * listener. The process does not print the code, does not exit, and does not
 * serve — it just sits there, so the only symptom is a client timing out and
 * an empty log. That cost real debugging time on this project: three
 * "silent startup hangs" were one stale instance holding :4000.
 */
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[api] port ${env.PORT} is already in use — another instance is ` +
        `probably still running. Find it with:  ss -ltnp | grep :${env.PORT}`,
    );
  } else {
    console.error("[api] failed to start:", err);
  }
  process.exit(1);
});

/**
 * Shut down in the right order: stop accepting, finish in-flight, then close
 * the pool.
 *
 * Closing the pool first would fail the requests already being served. The
 * timeout is the backstop — a hung request must not hold a deploy open for
 * ever.
 */
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.log(`[api] ${signal} — shutting down`);
    const force = setTimeout(() => {
      console.error("[api] forced exit after 10s");
      process.exit(1);
    }, 10_000);
    /* Do not keep the loop alive just for the timer. */
    force.unref();

    server.close(async () => {
      await pool.end().catch(() => {});
      process.exit(0);
    });
  });
}
