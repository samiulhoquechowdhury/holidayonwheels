import { describe, it, expect, beforeEach } from "vitest";
import { encode } from "@auth/core/jwt";
import { eq } from "drizzle-orm";
import { api, makeUser, resetTables, db, t } from "../test/helpers";
import { env } from "../env";

/**
 * Who the API thinks you are.
 *
 * These are the checks that decide every other permission in the service, so
 * they are tested against both credential formats rather than just the one
 * that is convenient.
 */
describe("session", () => {
  beforeEach(resetTables);

  it("is anonymous with no credentials", async () => {
    const res = await api().get("/api/v1/me").expect(200);
    expect(res.body.data).toBeNull();
  });

  it("resolves a session-table token from the cookie", async () => {
    const user = await makeUser("admin");
    const res = await api()
      .get("/api/v1/me")
      .set("Cookie", user.auth)
      .expect(200);
    expect(res.body.data).toMatchObject({ email: user.email, role: "admin" });
  });

  it("accepts the same token as a bearer header", async () => {
    const user = await makeUser("staff");
    const res = await api()
      .get("/api/v1/me")
      .set("Authorization", `Bearer ${user.token}`)
      .expect(200);
    expect(res.body.data.role).toBe("staff");
  });

  /**
   * The cross-process contract. A password sign-in in the Next.js app writes
   * an encrypted JWT, not a session row, so this is the path that actually
   * carries most real requests — and the one that would break silently if the
   * salt convention changed.
   */
  it("decodes an Auth.js JWT and reads the role from the database", async () => {
    const user = await makeUser("admin");
    const token = await encode({
      token: { sub: user.id },
      secret: env.AUTH_SECRET,
      /* Auth.js uses the cookie name as the salt. See `attachSession`. */
      salt: "authjs.session-token",
    });

    const res = await api()
      .get("/api/v1/me")
      .set("Cookie", `authjs.session-token=${token}`)
      .expect(200);
    expect(res.body.data).toMatchObject({ id: user.id, role: "admin" });
  });

  it("reflects a role change on the next request, without a new token", async () => {
    const user = await makeUser("admin");
    await db
      .update(t.users)
      .set({ role: "staff" })
      .where(eq(t.users.id, user.id));

    const res = await api().get("/api/v1/me").set("Cookie", user.auth);
    expect(res.body.data.role).toBe("staff");
  });

  it("ejects a disabled account immediately", async () => {
    const user = await makeUser("admin");
    await db
      .update(t.users)
      .set({ disabledAt: new Date() })
      .where(eq(t.users.id, user.id));

    const res = await api().get("/api/v1/me").set("Cookie", user.auth);
    expect(res.body.data).toBeNull();
  });

  it("rejects an expired session row", async () => {
    const user = await makeUser("traveller");
    await db
      .update(t.sessions)
      .set({ expires: new Date(Date.now() - 1000) })
      .where(eq(t.sessions.sessionToken, user.token));

    const res = await api().get("/api/v1/me").set("Cookie", user.auth);
    expect(res.body.data).toBeNull();
  });

  it("rejects a token signed with the wrong secret", async () => {
    const user = await makeUser("admin");
    const forged = await encode({
      token: { sub: user.id },
      secret: "x".repeat(64),
      salt: "authjs.session-token",
    });

    const res = await api()
      .get("/api/v1/me")
      .set("Cookie", `authjs.session-token=${forged}`);
    expect(res.body.data).toBeNull();
  });

  it("rejects a garbage cookie without erroring", async () => {
    const res = await api()
      .get("/api/v1/me")
      .set("Cookie", "authjs.session-token=not-a-token")
      .expect(200);
    expect(res.body.data).toBeNull();
  });
});
