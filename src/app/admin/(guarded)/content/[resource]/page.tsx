import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  findResource,
  RESOURCES,
  type ResourceField,
} from "@/lib/admin-resources";
import { formatINR } from "@/lib/currency";
import {
  PageHeading,
  DataTable,
  Row,
  Cell,
  StatusPill,
  LoadError,
} from "@/components/admin/Shell";
import { ActionForm, SubmitButton } from "@/components/admin/ActionForm";
import { setPublishState } from "../../office-actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string }>;
}): Promise<Metadata> {
  const { resource } = await params;
  const def = findResource(resource);
  return {
    title: def ? def.title : "Content",
    robots: { index: false, follow: false, nocache: true },
  };
}

/**
 * One editable resource, listed.
 *
 * ## Why one page serves all fifteen
 *
 * The API exposes every catalogue table through the same seven endpoints, and
 * `admin-resources.ts` says what each one is called and which fields belong
 * in a list. So this page is written once. Fifteen copies would differ on
 * details that matter — whether `?q=` is preserved across a publish, whether
 * the status filter is honoured — and the differences would be invisible.
 *
 * ## Why `resource` is looked up and never interpolated
 *
 * `findResource` returns undefined for anything not on the list, and this
 * 404s. Passing the segment straight into the API path would let
 * `/admin/content/users` render the accounts table from a page staff can
 * reach, and `../` sequences reach further still.
 *
 * ## What this does not do
 *
 * Create and edit whole records. The forms for that are per-resource by
 * nature — a tour has a nineteen-day itinerary editor, a café has a sentence
 * — and a generic field-by-field form over twenty-nine columns is worse than
 * none. What is here is the part that is genuinely common: find a record, see
 * its state, change whether it is live.
 */
export default async function AdminResourceListPage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { resource } = await params;
  const { q, status } = await searchParams;

  const def = findResource(resource);
  if (!def) notFound();

  const query = new URLSearchParams({ limit: "200" });
  if (q) query.set("q", q);
  /*
   * Default to every state, including drafts and archived. This is the
   * office's list: a draft the client started yesterday is exactly what they
   * come here to find, and the API only returns drafts to staff anyway.
   */
  query.set("status", status ?? "draft,published,archived");

  const result = await apiFetch<Record<string, unknown>[]>(
    `/${def.slug}?${query}`,
  );

  if (!result.ok) {
    return (
      <>
        <Breadcrumb />
        <PageHeading title={def.title} />
        <LoadError
          what={def.title.toLowerCase()}
          message={result.error.message}
        />
      </>
    );
  }

  const rows = result.data;
  const total =
    (result.meta as { total?: number } | undefined)?.total ?? rows.length;
  const drafts = rows.filter((r) => r.status === "draft").length;

  return (
    <>
      <Breadcrumb />

      <div className="mt-4">
        <PageHeading title={def.title} intro={def.blurb} />
      </div>

      <p className="text-13 text-ink-softer mt-4">
        {total} {total === 1 ? def.singular : `${def.singular}s`}
        {def.publishable && drafts > 0 ? ` · ${drafts} in draft` : ""}
      </p>

      {def.publishable ? (
        <nav
          className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2"
          aria-label={`Filter ${def.title}`}
        >
          <StateLink resource={def.slug} value={undefined} current={status}>
            All
          </StateLink>
          <StateLink resource={def.slug} value="published" current={status}>
            Live
          </StateLink>
          <StateLink resource={def.slug} value="draft" current={status}>
            Draft
          </StateLink>
          <StateLink resource={def.slug} value="archived" current={status}>
            Archived
          </StateLink>

          <form
            method="GET"
            action={`/admin/content/${def.slug}`}
            className="ml-auto flex items-center gap-2"
          >
            {status ? (
              <input type="hidden" name="status" value={status} />
            ) : null}
            <label htmlFor="q" className="u-label text-ink-faint">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q ?? ""}
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
      ) : null}

      <DataTable
        columns={[
          "Name",
          ...def.columns.map((c) => c.label),
          ...(def.publishable ? ["State", "Change"] : []),
        ]}
        empty={
          q
            ? `No ${def.singular}s match that search.`
            : `No ${def.singular}s yet.`
        }
      >
        {rows.map((row, i) => {
          const id = String(row.id ?? row.key ?? row.place ?? row.state ?? i);
          const slug = typeof row.slug === "string" ? row.slug : null;
          const name = String(row[def.titleField] ?? "—");
          const state = typeof row.status === "string" ? row.status : null;

          return (
            <Row key={id}>
              <Cell label="Name">
                <span className="text-ink">{name}</span>
                {slug ? (
                  <span className="text-13 text-ink-softer block">{slug}</span>
                ) : null}
                {/*
                  A link to the live page, only where the record is actually
                  published — a link to a draft's URL would 404, and the rule
                  on this project is that no control goes nowhere.
                */}
                {def.publicPath && slug && state === "published" ? (
                  <Link
                    href={def.publicPath(slug)}
                    className="u-label text-ink-softer mt-1 inline-block underline underline-offset-4 hover:text-ink"
                  >
                    view
                  </Link>
                ) : null}
              </Cell>

              {def.columns.map((c) => (
                <Cell key={c.key} label={c.label} numeric={c.numeric}>
                  {renderValue(row[c.key], c)}
                </Cell>
              ))}

              {def.publishable ? (
                <>
                  <Cell label="State">
                    {state ? <StatusPill status={state} /> : "—"}
                  </Cell>
                  <Cell label="Change">
                    <div className="flex flex-wrap gap-2">
                      {state !== "published" ? (
                        <ActionForm
                          action={setPublishState}
                          hidden={{ resource: def.slug, id, action: "publish" }}
                        >
                          <SubmitButton pendingLabel="…">Publish</SubmitButton>
                        </ActionForm>
                      ) : null}
                      {state === "published" ? (
                        <ActionForm
                          action={setPublishState}
                          hidden={{
                            resource: def.slug,
                            id,
                            action: "unpublish",
                          }}
                        >
                          <SubmitButton pendingLabel="…">
                            Unpublish
                          </SubmitButton>
                        </ActionForm>
                      ) : null}
                      {state !== "archived" ? (
                        <ActionForm
                          action={setPublishState}
                          hidden={{ resource: def.slug, id, action: "archive" }}
                        >
                          <SubmitButton variant="danger" pendingLabel="…">
                            Archive
                          </SubmitButton>
                        </ActionForm>
                      ) : null}
                    </div>
                  </Cell>
                </>
              ) : null}
            </Row>
          );
        })}
      </DataTable>
    </>
  );
}

/**
 * One value in a cell.
 *
 * Null is an em dash and not "0" or "—" chosen at the call site, because for
 * a homestay a null `fromPrice` means "ask us" and printing a zero there
 * would publish a price nobody quoted. Booleans become words; a bare "true"
 * in a table is not English.
 */
function renderValue(value: unknown, field: ResourceField): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="text-ink-softer">—</span>;
  }
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (field.money && typeof value === "number") return formatINR(value);
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

function Breadcrumb() {
  return (
    <p className="u-label">
      <Link href="/admin/content" className="text-ink-faint hover:text-ink">
        ← Content
      </Link>
    </p>
  );
}

function StateLink({
  resource,
  value,
  current,
  children,
}: {
  resource: string;
  value: string | undefined;
  current: string | undefined;
  children: React.ReactNode;
}) {
  const href = value
    ? `/admin/content/${resource}?status=${value}`
    : `/admin/content/${resource}`;
  const active = current === value;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "u-label rounded-full bg-ink px-3 py-1.5 text-night-text"
          : "u-label rounded-full px-3 py-1.5 text-ink-soft hover:text-ink"
      }
    >
      {children}
    </Link>
  );
}

/**
 * Pre-render nothing, but constrain the segment to the known resources.
 *
 * `dynamicParams` stays at its default so these are still rendered on demand;
 * what this buys is that the route is declared over a closed set, which is
 * the same guarantee `findResource` enforces at runtime, stated once more
 * where Next can see it.
 */
export function generateStaticParams() {
  return RESOURCES.map((r) => ({ resource: r.slug }));
}
