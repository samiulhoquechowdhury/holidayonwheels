import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodError, type ZodSchema } from "zod";

/**
 * One error shape, and one way to reach it.
 *
 * ## Why every failure is the same JSON
 *
 * Two clients consume this API: the admin UI and the traveller account pages.
 * Both need to tell "your input was wrong, here is which field" apart from
 * "you are not allowed" and "something broke". An API that returns a string
 * for one and an object for another makes every call site guess. So: always
 * `{ error: { code, message, details? } }`, and the status code carries the
 * category.
 *
 * ## Why messages are written for the person reading them
 *
 * These strings reach the admin UI and are shown. "duplicate key value
 * violates unique constraint tours_slug_unique" is not something to put in
 * front of the client; "A tour with that web address already exists" is. The
 * Postgres text still goes to the log.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, "bad_request", message, details);
  }
  static unauthorized(message = "You are not signed in.") {
    return new ApiError(401, "unauthorized", message);
  }
  static forbidden(message = "You do not have access to that.") {
    return new ApiError(403, "forbidden", message);
  }
  static notFound(message = "Not found.") {
    return new ApiError(404, "not_found", message);
  }
  static conflict(message: string, details?: unknown) {
    return new ApiError(409, "conflict", message, details);
  }
}

/**
 * Wrap an async handler so a rejected promise reaches the error middleware.
 *
 * Express 4 does not await handlers: an async function that throws rejects a
 * promise nobody is holding, which Express never sees. The request then hangs
 * until the client times out, and the only trace is an
 * `unhandledRejection` warning. This is not optional sugar — every async
 * route in this codebase goes through it.
 */
export function asyncHandler<T extends RequestHandler>(fn: T): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/** Parse a request part with zod, or raise a 400 listing the bad fields. */
export function parseOr400<T>(schema: ZodSchema<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  throw ApiError.badRequest(
    "Some of the values sent were not valid.",
    fieldErrors(result.error),
  );
}

/** `{ "price_bands.0.perPerson": "Expected number" }` — addressable by the form. */
export function fieldErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "(root)";
    /* First message per field: a form shows one error under an input. */
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

export function sendError(res: Response, err: ApiError) {
  res.status(err.status).json({
    error: { code: err.code, message: err.message, details: err.details },
  });
}

/** Shared pagination, so every list endpoint behaves the same way. */
export function pagination(req: Request): { limit: number; offset: number } {
  const rawLimit = Number(req.query.limit ?? 50);
  const rawOffset = Number(req.query.offset ?? 0);
  /*
   * Capped at 200. Without a ceiling, `?limit=1000000` is a request to
   * serialise the whole table into memory — a denial of service that costs
   * the caller one URL.
   */
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), 200)
    : 50;
  const offset = Number.isFinite(rawOffset)
    ? Math.max(Math.trunc(rawOffset), 0)
    : 0;
  return { limit, offset };
}

export type { NextFunction, Request, Response };
