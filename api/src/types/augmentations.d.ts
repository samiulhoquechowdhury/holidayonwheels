/**
 * Type augmentations that have to be loaded, not merely installed.
 *
 * `pino-http` declares `log` on `http.IncomingMessage`, which is what Express
 * `Request` extends — but only if its declarations are part of the program.
 * Nothing imports `pino-http` for its types, so without this reference every
 * `req.log` is a TS2339 even though it works perfectly at runtime. That gap
 * between "compiles" and "works" is the wrong way round and worth closing
 * explicitly.
 */

/// <reference types="pino-http" />

import type { SessionUser } from "../middleware/session";

declare global {
  namespace Express {
    interface Request {
      /** Set by `attachSession` when the request carries a valid session. */
      user?: SessionUser;
      /** The opaque Auth.js session token this request was identified by. */
      sessionToken?: string;
    }
  }
}
