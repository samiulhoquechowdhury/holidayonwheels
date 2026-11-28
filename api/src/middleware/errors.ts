import type { Request, Response, NextFunction } from "express";
import { ApiError, sendError } from "../lib/http";

/** Anything that fell through the router is a 404, in the standard shape. */
export function notFoundHandler(req: Request, res: Response) {
  sendError(res, ApiError.notFound(`No route for ${req.method} ${req.path}.`));
}

/**
 * The last stop. Turns anything thrown into the one error shape.
 *
 * ## Why Postgres error codes are translated here
 *
 * A unique-violation is a 409 and a foreign-key violation is a 400 — those
 * are facts about the request, not server faults, and returning 500 for them
 * makes the admin UI show "something went wrong" when the real answer is
 * "that web address is taken". Translating at the boundary means every route
 * gets the behaviour without a try/catch around each insert.
 *
 * ## Why unknown errors do not echo their message
 *
 * An unexpected throw can carry a connection string, a query with values
 * inlined, or a file path. The client gets a fixed sentence and a code; the
 * detail goes to the log, where it is useful and not public.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    /* 5xx raised deliberately is still worth a log line. */
    if (err.status >= 500) req.log?.error({ err }, "api error");
    return sendError(res, err);
  }

  const pg = err as { code?: string; constraint?: string; detail?: string };

  switch (pg?.code) {
    /* unique_violation */
    case "23505":
      return sendError(
        res,
        ApiError.conflict(
          constraintMessage(pg.constraint) ?? "That value is already taken.",
          { constraint: pg.constraint },
        ),
      );
    /* foreign_key_violation */
    case "23503":
      return sendError(
        res,
        ApiError.badRequest(
          "That refers to something which does not exist, or is still in use.",
          { constraint: pg.constraint },
        ),
      );
    /* not_null_violation */
    case "23502":
      return sendError(
        res,
        ApiError.badRequest("A required value was missing.", {
          constraint: pg.constraint,
        }),
      );
    /* check_violation — the schema's CHECKs are the last line of defence,
     * and reaching one means a zod schema is missing a rule. Worth logging
     * loudly rather than quietly returning 400. */
    case "23514":
      req.log?.warn(
        { constraint: pg.constraint },
        "check constraint reached — a validator is missing this rule",
      );
      return sendError(
        res,
        ApiError.badRequest(
          constraintMessage(pg.constraint) ??
            "Those values are not allowed together.",
          { constraint: pg.constraint },
        ),
      );
  }

  req.log?.error({ err }, "unhandled error");
  return sendError(
    res,
    new ApiError(500, "internal_error", "Something went wrong on our side."),
  );
}

/**
 * Turn a constraint name into a sentence a person can act on.
 *
 * Unlisted constraints fall back to the generic message rather than leaking
 * the raw name into the UI.
 */
function constraintMessage(constraint?: string): string | null {
  if (!constraint) return null;
  const map: Record<string, string> = {
    tours_slug_unique: "A tour with that web address already exists.",
    homestays_slug_unique: "A homestay with that web address already exists.",
    motorcycle_tours_slug_unique:
      "An expedition with that web address already exists.",
    events_slug_unique: "An event with that web address already exists.",
    activities_slug_unique: "An activity with that web address already exists.",
    cafes_slug_unique: "A café with that web address already exists.",
    journal_posts_slug_unique: "A post with that web address already exists.",
    users_email_unique: "An account with that email address already exists.",
    bookings_reference_unique: "That booking reference is already in use.",
    homestays_rating_range: "A rating has to be between 0 and 5.",
    homestays_price_nonneg: "A price cannot be negative.",
    bookings_paid_within_total:
      "The amount paid cannot be more than the total.",
    bookings_product_matches_kind:
      "The booking's type does not match the product it points at.",
    departures_exactly_one_parent:
      "A departure belongs to either a tour or an expedition, not both.",
    departures_dates_ordered: "A departure cannot end before it starts.",
    bookings_dates_ordered: "A booking cannot end before it starts.",
    events_dates_ordered: "An event cannot end before it starts.",
    permits_dates_ordered: "A permit cannot expire before it starts.",
  };
  return map[constraint] ?? null;
}
