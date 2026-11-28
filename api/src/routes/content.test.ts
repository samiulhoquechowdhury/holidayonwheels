import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { api, makeUser, makeTour, resetTables, db, t } from "../test/helpers";

/**
 * Who can read what, and who can change it.
 *
 * The visibility rule is the one most likely to regress into a leak: an
 * unpublished price or an unfinished description becoming readable by anyone
 * who guesses a slug.
 */
describe("content visibility", () => {
  beforeEach(resetTables);

  it("hides drafts from anonymous callers in lists, search and by slug", async () => {
    await makeTour({ slug: "published-one" });
    const { tour } = await makeTour({ slug: "secret-draft" });
    await db
      .update(t.tours)
      .set({ status: "draft" })
      .where(eq(t.tours.id, tour.id));

    const list = await api().get("/api/v1/tours").expect(200);
    expect(list.body.meta.total).toBe(1);
    expect(list.body.data.map((r: { slug: string }) => r.slug)).toEqual([
      "published-one",
    ]);

    const search = await api().get("/api/v1/tours?q=secret").expect(200);
    expect(search.body.meta.total).toBe(0);

    await api().get("/api/v1/tours/secret-draft").expect(404);
  });

  it("shows drafts to staff", async () => {
    const { tour } = await makeTour({ slug: "a-draft" });
    await db
      .update(t.tours)
      .set({ status: "draft" })
      .where(eq(t.tours.id, tour.id));

    const staff = await makeUser("staff");
    const res = await api()
      .get("/api/v1/tours")
      .set("Cookie", staff.auth)
      .expect(200);
    expect(res.body.meta.total).toBe(1);
  });

  it("ignores ?status=draft for anonymous callers rather than honouring it", async () => {
    const { tour } = await makeTour();
    await db
      .update(t.tours)
      .set({ status: "draft" })
      .where(eq(t.tours.id, tour.id));

    const res = await api().get("/api/v1/tours?status=draft").expect(200);
    expect(res.body.meta.total).toBe(0);
  });

  it("caps limit so one request cannot ask for the whole table", async () => {
    await makeTour();
    const res = await api().get("/api/v1/tours?limit=100000").expect(200);
    expect(res.body.meta.limit).toBe(200);
  });

  it("does not 500 on a slug where a uuid column is compared", async () => {
    /* A bare `eq(id, "the-tawang-run")` makes Postgres raise 22P02. */
    await api().get("/api/v1/tours/not-a-uuid-at-all").expect(404);
  });
});

describe("content writes", () => {
  beforeEach(resetTables);

  const valid = {
    slug: "a-new-tour",
    title: "A new tour",
    strapline: "s",
    region: "assam",
    states: ["assam"],
    types: ["group"],
    nights: 3,
    days: 4,
    fromPrice: 40_000,
    priceBands: [
      { fromPax: 2, perPerson: 40_000 },
      { fromPax: 6, perPerson: 36_000 },
    ],
    intro: "i",
    difficulty: "easy",
    groupSizeMax: 8,
    startsAt: "Guwahati",
    endsAt: "Guwahati",
    heroAlt: "alt",
  };

  it("refuses anonymous writes", async () => {
    await api().post("/api/v1/tours").send(valid).expect(401);
  });

  it("refuses staff writes with a message naming the role needed", async () => {
    const staff = await makeUser("staff");
    const res = await api()
      .post("/api/v1/tours")
      .set("Cookie", staff.auth)
      .send(valid)
      .expect(403);
    expect(res.body.error.message).toMatch(/admin account/i);
  });

  it("creates as draft, never published, for an admin", async () => {
    const admin = await makeUser("admin");
    const res = await api()
      .post("/api/v1/tours")
      .set("Cookie", admin.auth)
      .send(valid)
      .expect(201);
    expect(res.body.data.status).toBe("draft");
  });

  it("rejects a duplicate slug with a readable 409", async () => {
    const admin = await makeUser("admin");
    await api()
      .post("/api/v1/tours")
      .set("Cookie", admin.auth)
      .send(valid)
      .expect(201);
    const res = await api()
      .post("/api/v1/tours")
      .set("Cookie", admin.auth)
      .send(valid)
      .expect(409);
    expect(res.body.error.message).toMatch(/already exists/i);
  });

  it("rejects an unknown field instead of ignoring it", async () => {
    const admin = await makeUser("admin");
    const res = await api()
      .post("/api/v1/tours")
      .set("Cookie", admin.auth)
      .send({ ...valid, from_price: 1 })
      .expect(400);
    expect(JSON.stringify(res.body.error.details)).toMatch(/from_price/);
  });

  it("rejects a slug with spaces", async () => {
    const admin = await makeUser("admin");
    const res = await api()
      .post("/api/v1/tours")
      .set("Cookie", admin.auth)
      .send({ ...valid, slug: "not a slug" })
      .expect(400);
    expect(res.body.error.details.slug).toMatch(/lower-case/i);
  });

  it("will not let a server-owned field be set by the caller", async () => {
    const admin = await makeUser("admin");
    const res = await api()
      .post("/api/v1/tours")
      .set("Cookie", admin.auth)
      .send({ ...valid, id: "11111111-1111-1111-1111-111111111111" })
      .expect(400);
    expect(JSON.stringify(res.body.error.details)).toMatch(/id/);
  });

  /**
   * The gap that was live for a while: `.partial()` on a refined schema drops
   * the refinements, so every cross-field rule was enforced on create and
   * skipped on update — and update is where prices get changed.
   */
  it("enforces cross-field rules on update, not only on create", async () => {
    const admin = await makeUser("admin");
    const created = await api()
      .post("/api/v1/tours")
      .set("Cookie", admin.auth)
      .send(valid)
      .expect(201);
    const id = created.body.data.id;

    /* A bigger party cannot pay more each. */
    const bands = await api()
      .patch(`/api/v1/tours/${id}`)
      .set("Cookie", admin.auth)
      .send({
        priceBands: [
          { fromPax: 2, perPerson: 40_000 },
          { fromPax: 6, perPerson: 55_000 },
        ],
      })
      .expect(400);
    expect(JSON.stringify(bands.body.error.details)).toMatch(
      /cannot pay more/i,
    );

    /* Changing nights alone must not leave the day count wrong. */
    const nights = await api()
      .patch(`/api/v1/tours/${id}`)
      .set("Cookie", admin.auth)
      .send({ nights: 7 })
      .expect(400);
    expect(nights.body.error.details.days).toMatch(/7-night trip runs 8 days/);

    /* And a consistent change still works. */
    await api()
      .patch(`/api/v1/tours/${id}`)
      .set("Cookie", admin.auth)
      .send({ nights: 7, days: 8 })
      .expect(200);
  });

  it("writes an audit entry naming the actor, and none for a no-op", async () => {
    const admin = await makeUser("admin");
    const created = await api()
      .post("/api/v1/tours")
      .set("Cookie", admin.auth)
      .send(valid)
      .expect(201);

    await api()
      .patch(`/api/v1/tours/${created.body.data.id}`)
      .set("Cookie", admin.auth)
      .send({ strapline: "changed" })
      .expect(200);

    /* Same value again — nothing actually changes. */
    await api()
      .patch(`/api/v1/tours/${created.body.data.id}`)
      .set("Cookie", admin.auth)
      .send({ strapline: "changed" })
      .expect(200);

    const entries = await db.select().from(t.auditLog);
    const updates = entries.filter((e) => e.action === "update");
    expect(entries.some((e) => e.action === "create")).toBe(true);
    expect(entries.every((e) => e.actorEmail === admin.email)).toBe(true);
    expect(updates).toHaveLength(1);
  });

  it("publishes, unpublishes and archives", async () => {
    const admin = await makeUser("admin");
    const created = await api()
      .post("/api/v1/tours")
      .set("Cookie", admin.auth)
      .send(valid)
      .expect(201);
    const id = created.body.data.id;

    for (const [action, expected] of [
      ["publish", "published"],
      ["unpublish", "draft"],
      ["archive", "archived"],
    ] as const) {
      const res = await api()
        .post(`/api/v1/tours/${id}/${action}`)
        .set("Cookie", admin.auth)
        .expect(200);
      expect(res.body.data.status).toBe(expected);
    }
  });
});

describe("homestay price and rating rules", () => {
  beforeEach(resetTables);

  const house = {
    slug: "a-house",
    name: "A house",
    strapline: "s",
    state: "assam",
    region: "assam",
    locality: "Guwahati",
    lat: 26.1,
    lng: 91.7,
    intro: "i",
    heroAlt: "alt",
  };

  /**
   * The rule that protects the four real Guwahati houses whose rates we were
   * never given: absent must stay absent and must never become a number.
   */
  it("accepts a house with no rate at all", async () => {
    const admin = await makeUser("admin");
    const res = await api()
      .post("/api/v1/homestays")
      .set("Cookie", admin.auth)
      .send(house)
      .expect(201);
    expect(res.body.data.fromPrice).toBeNull();
    expect(res.body.data.rating).toBeNull();
  });

  it("refuses a rating without a review count", async () => {
    const admin = await makeUser("admin");
    const res = await api()
      .post("/api/v1/homestays")
      .set("Cookie", admin.auth)
      .send({ ...house, rating: 4.8 })
      .expect(400);
    expect(JSON.stringify(res.body.error.details)).toMatch(/reviewCount/);
  });

  it("refuses a rating above five", async () => {
    const admin = await makeUser("admin");
    await api()
      .post("/api/v1/homestays")
      .set("Cookie", admin.auth)
      .send({ ...house, rating: 7, reviewCount: 10 })
      .expect(400);
  });
});
