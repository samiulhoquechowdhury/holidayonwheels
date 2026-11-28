import { handlers } from "@/auth";

/**
 * Auth.js's own endpoints: sign-in, sign-out, session, CSRF, and the OAuth
 * callback.
 *
 * Nothing is added here. The route exists so `signIn()` called from a server
 * action has somewhere to post, and so Google has a callback URL to return to
 * when it is added — at which point this file does not change.
 */
export const { GET, POST } = handlers;
