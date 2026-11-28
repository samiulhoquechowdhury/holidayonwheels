import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import { officeUser } from "@/lib/office-session";
import {
  PageHeading,
  DataTable,
  Row,
  Cell,
  LoadError,
} from "@/components/admin/Shell";
import {
  ActionForm,
  SubmitSelect,
  SubmitButton,
} from "@/components/admin/ActionForm";
import { setUserRole, setUserDisabled } from "../office-actions";

export const metadata: Metadata = {
  title: "Accounts",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "traveller" | "staff" | "admin";
  phone: string | null;
  disabledAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

/**
 * Accounts, and who may do what.
 *
 * ## Why there is no delete
 *
 * Disabling, not deleting. A deleted user takes their bookings with them or
 * orphans them, and the business has to keep the record of a trip it sold.
 * Disabling is immediate — the API re-reads `disabled_at` on every request,
 * so the person's next click fails — and reversible, which a delete is not.
 *
 * ## Why the last administrator cannot be demoted here
 *
 * The API refuses it, and so does demoting yourself. Both are one careless
 * click from an organisation with no administrator at all, recoverable only
 * by somebody with database access. The controls are still rendered rather
 * than hidden: the refusal comes back as a sentence explaining why, which
 * teaches the rule. A disabled control teaches nothing.
 *
 * ## No password field
 *
 * Setting somebody else's password means knowing it, which means it travels
 * through a chat message. The API supports it for the seeding script; this
 * screen deliberately does not expose it. A reset flow by email is the right
 * answer and needs a mail provider this project does not have yet.
 */
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const { role, q } = await searchParams;

  const params = new URLSearchParams({ limit: "200" });
  if (role) params.set("role", role);
  if (q) params.set("q", q);

  const [me, result] = await Promise.all([
    officeUser(),
    apiFetch<User[]>(`/users?${params}`),
  ]);

  if (!result.ok) {
    return (
      <>
        <PageHeading title="Accounts" />
        <LoadError what="accounts" message={result.error.message} />
      </>
    );
  }

  const rows = result.data;
  const activeAdmins = rows.filter(
    (u) => u.role === "admin" && !u.disabledAt,
  ).length;

  return (
    <>
      <PageHeading
        title="Accounts"
        intro="Travellers who have signed up, and the people who run the office."
      />

      <nav
        className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2"
        aria-label="Filter accounts"
      >
        <RoleLink href="/admin/users" active={!role}>
          Everyone
        </RoleLink>
        <RoleLink href="/admin/users?role=admin" active={role === "admin"}>
          Administrators
        </RoleLink>
        <RoleLink href="/admin/users?role=staff" active={role === "staff"}>
          Staff
        </RoleLink>
        <RoleLink
          href="/admin/users?role=traveller"
          active={role === "traveller"}
        >
          Travellers
        </RoleLink>

        <form
          method="GET"
          action="/admin/users"
          className="ml-auto flex items-center gap-2"
        >
          {role ? <input type="hidden" name="role" value={role} /> : null}
          <label htmlFor="q" className="u-label text-ink-faint">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="name or email"
            className="min-h-9 w-52 rounded-[var(--radius-input)] border border-[var(--ink-hairline-strong)] bg-paper px-3 text-14"
          />
          <button
            type="submit"
            className="u-label min-h-9 rounded-full border border-[var(--ink-hairline-strong)] px-3 text-ink-soft hover:border-ink hover:text-ink"
          >
            Go
          </button>
        </form>
      </nav>

      {activeAdmins === 1 ? (
        <p className="text-13 text-ink-softer mt-6">
          There is one active administrator. Promote somebody else before
          changing or disabling that account — the system will refuse until you
          do.
        </p>
      ) : null}

      <DataTable
        columns={["Name", "Email", "Role", "Last signed in", "Access"]}
        empty={
          q || role ? "No accounts match that filter." : "No accounts yet."
        }
      >
        {rows.map((u) => {
          const isMe = u.id === me?.id;
          return (
            <Row key={u.id}>
              <Cell label="Name">
                {u.name ?? <span className="text-ink-softer">—</span>}
                {isMe ? (
                  <span className="u-label text-ink-softer ml-2">you</span>
                ) : null}
                {u.disabledAt ? (
                  <span className="u-label ml-2 text-clay-ink">disabled</span>
                ) : null}
              </Cell>

              <Cell label="Email">
                <span className="break-all">{u.email}</span>
                {u.phone ? (
                  <span className="text-13 text-ink-softer block">
                    {u.phone}
                  </span>
                ) : null}
              </Cell>

              <Cell label="Role">
                <ActionForm action={setUserRole} hidden={{ userId: u.id }}>
                  <SubmitSelect
                    name="role"
                    label={`Role for ${u.email}`}
                    defaultValue={u.role}
                    options={[
                      { value: "traveller", label: "Traveller" },
                      { value: "staff", label: "Staff" },
                      { value: "admin", label: "Administrator" },
                    ]}
                  />
                </ActionForm>
              </Cell>

              <Cell label="Last signed in">
                {u.lastLoginAt ? (
                  new Date(u.lastLoginAt).toLocaleDateString("en-IN", {
                    dateStyle: "medium",
                  })
                ) : (
                  <span className="text-ink-softer">never</span>
                )}
              </Cell>

              <Cell label="Access">
                {isMe ? (
                  /*
                   * No control at all on your own row. The API refuses it, but
                   * offering a button whose only outcome is an error is worse
                   * than not offering it — and unlike the role rules, there is
                   * no legitimate case where this one should succeed.
                   */
                  <span className="text-13 text-ink-softer">
                    your own account
                  </span>
                ) : (
                  <ActionForm
                    action={setUserDisabled}
                    hidden={{
                      userId: u.id,
                      disabled: u.disabledAt ? "false" : "true",
                    }}
                  >
                    <SubmitButton
                      variant={u.disabledAt ? "quiet" : "danger"}
                      pendingLabel="…"
                    >
                      {u.disabledAt ? "Restore" : "Disable"}
                    </SubmitButton>
                  </ActionForm>
                )}
              </Cell>
            </Row>
          );
        })}
      </DataTable>

      <p className="text-13 text-ink-softer mt-8 max-w-prose">
        Disabling signs the person out everywhere immediately and keeps their
        bookings. Changing a role takes effect on their next request — they do
        not need to sign in again.
      </p>
    </>
  );
}

function RoleLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "u-label rounded-full bg-ink px-3 py-1.5 text-night-text"
          : "u-label rounded-full px-3 py-1.5 text-ink-soft hover:text-ink"
      }
    >
      {children}
    </a>
  );
}
