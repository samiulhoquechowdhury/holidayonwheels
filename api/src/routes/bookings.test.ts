import { describe, it, expect, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { api, makeUser, makeTour, resetTables, db, t } from "../test/helpers";

/**
 * Selling seats and taking money.
 *
 * This is the file worth having. Everything here is either a race, a money
 * invariant, or a rule about whose data somebody can see — the three places
 * where a bug costs the business rather than inconveniencing it.
 */
describe("bookings", () => {
  beforeEach(resetTables);

  const lead = {
    leadName: "Test Traveller",
    leadEmail: "t@test.invalid",
    leadPhone: "+919000000000",
  };

  /*
   * Not `async`. An async wrapper returns a Promise and loses supertest's
   * chainable `.expect(status)`, so every call site has to await first and
   * assert separately — which is how a forgotten assertion turns into a test
   * that passes whatever the server does.
   */
  const book = (auth: string, body: Record<string, unknown>) =>
    api().post("/api/v1/bookings").set("Cookie", auth).send(body);

  it("requires a session", async () => {
    const { tour, departure } = await makeTour();
    await api()
      .post("/api/v1/bookings")
      .send({
        kind: "tour",
        productId: tour.id,
        departureId: departure.id,
        startDate: "2027-06-01",
        endDate: "2027-06-05",
        travellers: 2,
        total: 80_000,
        ...lead,
      })
      .expect(401);
  });

  it("takes the seats it books", async () => {
    const user = await makeUser("traveller");
    const { tour, departure } = await makeTour({ seats: 10 });

    const res = await book(user.auth, {
      kind: "tour",
      productId: tour.id,
      departureId: departure.id,
      startDate: "2027-06-01",
      endDate: "2027-06-05",
      travellers: 3,
      total: 120_000,
      ...lead,
    }).expect(201);

    expect(res.body.data.reference).toMatch(/^HOW-[A-Z2-9]{6}$/);
    expect(res.body.data.status).toBe("pending-payment");

    const [after] = await db
      .select()
      .from(t.departures)
      .where(eq(t.departures.id, departure.id));
    expect(after!.seatsLeft).toBe(7);
  });

  it("refuses to overbook, and leaves the seat count untouched", async () => {
    const user = await makeUser("traveller");
    const { tour, departure } = await makeTour({ seats: 2 });

    await book(user.auth, {
      kind: "tour",
      productId: tour.id,
      departureId: departure.id,
      startDate: "2027-06-01",
      endDate: "2027-06-05",
      travellers: 3,
      total: 120_000,
      ...lead,
    }).expect(409);

    const [after] = await db
      .select()
      .from(t.departures)
      .where(eq(t.departures.id, departure.id));
    expect(after!.seatsLeft).toBe(2);
    expect(await db.select().from(t.bookings)).toHaveLength(0);
  });

  /**
   * The reason `seats_left` is a column and not a number inside a JSONB
   * array. Three simultaneous requests for two seats against a departure that
   * has three: exactly one may win.
   */
  it("allows exactly one winner when several book the last seats at once", async () => {
    const users = await Promise.all([
      makeUser("traveller"),
      makeUser("traveller"),
      makeUser("traveller"),
    ]);
    const { tour, departure } = await makeTour({ seats: 3 });

    const results = await Promise.all(
      users.map((u) =>
        book(u.auth, {
          kind: "tour",
          productId: tour.id,
          departureId: departure.id,
          startDate: "2027-06-01",
          endDate: "2027-06-05",
          travellers: 2,
          total: 80_000,
          ...lead,
        }),
      ),
    );

    const created = results.filter((r) => r.status === 201);
    const refused = results.filter((r) => r.status === 409);
    expect(created).toHaveLength(1);
    expect(refused).toHaveLength(2);

    const [after] = await db
      .select()
      .from(t.departures)
      .where(eq(t.departures.id, departure.id));
    expect(after!.seatsLeft).toBe(1);

    /* And the books balance: seats sold plus seats left equals the original. */
    const bookings = await db.select().from(t.bookings);
    const sold = bookings.reduce((n, b) => n + b.travellers, 0);
    expect(sold + after!.seatsLeft).toBe(3);
  });

  it("refuses a departure that belongs to a different product", async () => {
    const user = await makeUser("traveller");
    const a = await makeTour({ seats: 5 });
    const b = await makeTour({ seats: 5 });

    await book(user.auth, {
      kind: "tour",
      productId: a.tour.id,
      departureId: b.departure.id,
      startDate: "2027-06-01",
      endDate: "2027-06-05",
      travellers: 1,
      total: 40_000,
      ...lead,
    }).expect(409);
  });

  it("refuses an unpublished product", async () => {
    const user = await makeUser("traveller");
    const { tour, departure } = await makeTour();
    await db
      .update(t.tours)
      .set({ status: "draft" })
      .where(eq(t.tours.id, tour.id));

    await book(user.auth, {
      kind: "tour",
      productId: tour.id,
      departureId: departure.id,
      startDate: "2027-06-01",
      endDate: "2027-06-05",
      travellers: 1,
      total: 40_000,
      ...lead,
    }).expect(400);
  });

  /**
   * A traveller must not be able to attach a booking to somebody else's
   * account — they could then read it back from the account screens.
   */
  it("ignores userId from a traveller and honours it for staff", async () => {
    const traveller = await makeUser("traveller");
    const victim = await makeUser("traveller");
    const staff = await makeUser("staff");
    const { tour, departure } = await makeTour({ seats: 10 });

    const base = {
      kind: "tour",
      productId: tour.id,
      departureId: departure.id,
      startDate: "2027-06-01",
      endDate: "2027-06-05",
      travellers: 1,
      total: 40_000,
      ...lead,
    };

    const mine = await book(traveller.auth, {
      ...base,
      userId: victim.id,
    }).expect(201);
    expect(mine.body.data.userId).toBe(traveller.id);

    const theirs = await book(staff.auth, {
      ...base,
      userId: victim.id,
    }).expect(201);
    expect(theirs.body.data.userId).toBe(victim.id);
  });

  it("lets a traveller read only their own booking", async () => {
    const owner = await makeUser("traveller");
    const other = await makeUser("traveller");
    const staff = await makeUser("staff");
    const { tour, departure } = await makeTour({ seats: 10 });

    const created = await book(owner.auth, {
      kind: "tour",
      productId: tour.id,
      departureId: departure.id,
      startDate: "2027-06-01",
      endDate: "2027-06-05",
      travellers: 1,
      total: 40_000,
      ...lead,
    }).expect(201);
    const ref = created.body.data.reference;

    await api()
      .get(`/api/v1/bookings/${ref}`)
      .set("Cookie", owner.auth)
      .expect(200);
    await api()
      .get(`/api/v1/bookings/${ref}`)
      .set("Cookie", other.auth)
      .expect(404);
    await api()
      .get(`/api/v1/bookings/${ref}`)
      .set("Cookie", staff.auth)
      .expect(200);
  });

  it("keeps staff notes away from the traveller", async () => {
    const owner = await makeUser("traveller");
    const staff = await makeUser("staff");
    const { tour, departure } = await makeTour({ seats: 10 });

    const created = await book(owner.auth, {
      kind: "tour",
      productId: tour.id,
      departureId: departure.id,
      startDate: "2027-06-01",
      endDate: "2027-06-05",
      travellers: 1,
      total: 40_000,
      ...lead,
    }).expect(201);

    await api()
      .patch(`/api/v1/bookings/${created.body.data.id}`)
      .set("Cookie", staff.auth)
      .send({ staffNotes: "difficult customer" })
      .expect(200);

    const asOwner = await api()
      .get("/api/v1/account")
      .set("Cookie", owner.auth)
      .expect(200);
    const serialised = JSON.stringify(asOwner.body);
    expect(serialised).not.toMatch(/difficult customer/);
    expect(serialised).not.toMatch(/staffNotes/);
  });

  it("refuses a list of everyone's bookings to a traveller", async () => {
    const traveller = await makeUser("traveller");
    await api()
      .get("/api/v1/bookings")
      .set("Cookie", traveller.auth)
      .expect(403);
  });
});

describe("payments", () => {
  beforeEach(resetTables);

  async function bookingFor(total: number) {
    const owner = await makeUser("traveller");
    const staff = await makeUser("staff");
    const { tour, departure } = await makeTour({ seats: 10 });
    const created = await api()
      .post("/api/v1/bookings")
      .set("Cookie", owner.auth)
      .send({
        kind: "tour",
        productId: tour.id,
        departureId: departure.id,
        startDate: "2027-06-01",
        endDate: "2027-06-05",
        travellers: 2,
        total,
        leadName: "T",
        leadEmail: "t@test.invalid",
        leadPhone: "+91900",
      })
      .expect(201);
    return { owner, staff, departure, booking: created.body.data };
  }

  const pay = (auth: string, id: string, body: Record<string, unknown>) =>
    api()
      .post(`/api/v1/bookings/${id}/payments`)
      .set("Cookie", auth)
      .send(body);

  it("records a part payment and leaves the status alone", async () => {
    const { staff, booking } = await bookingFor(100_000);
    const res = await pay(staff.auth, booking.id, {
      amount: 30_000,
      method: "upi",
    }).expect(201);
    expect(res.body.data.booking.amountPaid).toBe(30_000);
    expect(res.body.data.booking.status).toBe("pending-payment");
  });

  it("confirms the booking when it is paid in full", async () => {
    const { staff, booking } = await bookingFor(100_000);
    await pay(staff.auth, booking.id, { amount: 40_000, method: "upi" }).expect(
      201,
    );
    const res = await pay(staff.auth, booking.id, {
      amount: 60_000,
      method: "cash",
    }).expect(201);
    expect(res.body.data.booking.amountPaid).toBe(100_000);
    expect(res.body.data.booking.status).toBe("confirmed");
  });

  /** The CHECK that catches 150000 typed in place of 15000. */
  it("refuses a payment taking the total over what was quoted", async () => {
    const { staff, booking } = await bookingFor(100_000);
    const res = await pay(staff.auth, booking.id, {
      amount: 120_000,
      method: "cash",
    }).expect(400);
    expect(res.body.error.message).toMatch(/cannot be more than the total/i);
  });

  it("refuses a refund larger than everything received", async () => {
    const { staff, booking } = await bookingFor(100_000);
    await pay(staff.auth, booking.id, { amount: 30_000, method: "upi" }).expect(
      201,
    );
    const res = await pay(staff.auth, booking.id, {
      amount: -50_000,
      method: "upi",
    }).expect(400);
    expect(res.body.error.message).toMatch(/larger than everything received/i);
  });

  it("recomputes amount_paid from the ledger rather than incrementing it", async () => {
    const { staff, booking } = await bookingFor(100_000);
    await pay(staff.auth, booking.id, { amount: 30_000, method: "upi" }).expect(
      201,
    );
    await pay(staff.auth, booking.id, {
      amount: -10_000,
      method: "upi",
    }).expect(201);

    const rows = await db
      .select()
      .from(t.payments)
      .where(eq(t.payments.bookingId, booking.id));
    const ledger = rows.reduce((n, p) => n + p.amount, 0);

    const [stored] = await db
      .select()
      .from(t.bookings)
      .where(eq(t.bookings.id, booking.id));
    expect(stored!.amountPaid).toBe(ledger);
    expect(stored!.amountPaid).toBe(20_000);
  });

  it("refuses a zero payment", async () => {
    const { staff, booking } = await bookingFor(100_000);
    await pay(staff.auth, booking.id, { amount: 0, method: "cash" }).expect(
      400,
    );
  });

  it("will not let a traveller record a payment on their own booking", async () => {
    const { owner, booking } = await bookingFor(100_000);
    await pay(owner.auth, booking.id, {
      amount: 100_000,
      method: "cash",
    }).expect(403);
  });
});

describe("cancelling", () => {
  beforeEach(resetTables);

  it("returns the seats once and only once", async () => {
    const owner = await makeUser("traveller");
    const staff = await makeUser("staff");
    const { tour, departure } = await makeTour({ seats: 5 });

    const created = await api()
      .post("/api/v1/bookings")
      .set("Cookie", owner.auth)
      .send({
        kind: "tour",
        productId: tour.id,
        departureId: departure.id,
        startDate: "2027-06-01",
        endDate: "2027-06-05",
        travellers: 2,
        total: 80_000,
        leadName: "T",
        leadEmail: "t@test.invalid",
        leadPhone: "+91900",
      })
      .expect(201);

    const seats = async () => {
      const [row] = await db
        .select()
        .from(t.departures)
        .where(eq(t.departures.id, departure.id));
      return row!.seatsLeft;
    };
    expect(await seats()).toBe(3);

    const cancel = () =>
      api()
        .patch(`/api/v1/bookings/${created.body.data.id}`)
        .set("Cookie", staff.auth)
        .send({ status: "cancelled" })
        .expect(200);

    const first = await cancel();
    expect(first.body.data.cancelledAt).toBeTruthy();
    expect(await seats()).toBe(5);

    /* Cancelling again must not hand back the same seats a second time. */
    await cancel();
    expect(await seats()).toBe(5);
  });
});
