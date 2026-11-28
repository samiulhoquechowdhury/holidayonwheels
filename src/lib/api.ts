import "server-only";

import { cookies } from "next/headers";

/**
 * Calling the Express API from a server component or a server action.
 *
 * ## Why the cookie has to be forwarded by hand
 *
 * A `fetch` from a server component is a request made by *this server*, not
 * by the browser. It carries none of the browser's cookies, so without this
 * the API sees an anonymous caller and returns published content only — or
 * 401s on anything personal. The symptom is the account page rendering as
 * though nobody is signed in while the header shows their name.
 *
 * So the session cookie is read with `next/headers` and passed along. The API
 * then decodes it exactly as it would from a browser; see
 * `api/src/middleware/session.ts`.
 *
 * ## Why reading cookies here makes callers dynamic
 *
 * `cookies()` opts the whole rendering tree out of static generation. That is
 * unavoidable and correct for per-user screens, but it is the reason this
 * module must not be used on marketing pages: one call from a destination
 * page would turn a prerendered page into a per-request render for everybody.
 * Those pages read content at build time and should keep doing so.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, string>;
};

export type ApiResult<T> =
  | { ok: true; data: T; meta?: Record<string, unknown> }
  | { ok: false; error: ApiError; status: number };

/**
 * One request to the API, with the caller's session attached.
 *
 * Returns a result rather than throwing. A failed API call on the account
 * page should render "we could not load your trips" next to the rest of the
 * page, not replace the whole screen with an error boundary — and a thrown
 * error in a server component does exactly that.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { asUser?: boolean },
): Promise<ApiResult<T>> {
  const { asUser = true, ...rest } = init ?? {};

  const headers = new Headers(rest.headers);
  headers.set("accept", "application/json");
  if (rest.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  if (asUser) {
    const jar = await cookies();
    /*
     * Both names, because Auth.js prefixes the cookie with `__Secure-` over
     * HTTPS and omits it on plain HTTP. Forwarding only the unprefixed one
     * works in development and silently fails in production.
     */
    const token =
      jar.get("__Secure-authjs.session-token")?.value ??
      jar.get("authjs.session-token")?.value;

    if (token) {
      /*
       * Sent as a bearer token rather than as a `Cookie` header. Same value
       * and the API accepts either, but forwarding a whole cookie jar to
       * another service sends everything in it — analytics ids, consent
       * flags, anything a later feature sets. This sends only the credential
       * the call actually needs.
       */
      headers.set("authorization", `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...rest,
      headers,
      /*
       * Never cached. Every path through this module is either per-user or a
       * mutation; a cached account page served to the next visitor is the
       * worst possible bug here.
       */
      cache: "no-store",
    });
  } catch (cause) {
    /*
     * The API being unreachable is an operational fact, not a programming
     * error — it is restarting, or the URL is wrong in an environment nobody
     * has checked. Reported as a result so the page can say so.
     */
    return {
      ok: false,
      status: 0,
      error: {
        code: "api_unreachable",
        message: "We could not reach the booking system just now.",
        details: { cause: String((cause as Error)?.message ?? cause) },
      },
    };
  }

  if (response.status === 204) {
    return { ok: true, data: undefined as T };
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    /* A non-JSON body from a JSON API means a proxy or a crash page. */
    return {
      ok: false,
      status: response.status,
      error: {
        code: "bad_response",
        message: "The booking system returned something unexpected.",
      },
    };
  }

  if (!response.ok) {
    const error = (payload as { error?: ApiError }).error;
    return {
      ok: false,
      status: response.status,
      error: error ?? {
        code: "unknown",
        message: "Something went wrong.",
      },
    };
  }

  const body = payload as { data: T; meta?: Record<string, unknown> };
  return { ok: true, data: body.data, meta: body.meta };
}
