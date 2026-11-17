import { requireRole } from "@/lib/firebase/session.ts";
import { formatTimeAgo } from "@/lib/format-time.ts";
import { APPLICATION_TYPES, getInviteStore } from "@/lib/invite-store.ts";
import { getMockAuthStore } from "@/lib/mock-auth-store.ts";
import { PageHeader } from "@/components/layouts/page-header";
import { CopyLinkButton } from "@/components/patterns/copy-link-button";
import { DataTable } from "@/components/patterns/data-table";
import { StatusPill } from "@/components/patterns/status-pill";
import { FormField } from "@/components/patterns/form-field";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createInvite } from "./actions.ts";

// Staff "Invitations": after consultation, retainer and payment, Admin
// invites the client (CURRENT_USER_FLOW_V2 onboarding). Each link works
// once; the client creates their account from it (A01).
export default async function AdminInvitationsPage({ searchParams }: PageProps<"/admin/invitations">) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const read = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");
  const created = read("created") ? getInviteStore().get(read("created")) : undefined;
  const error = read("error");
  const invites = getInviteStore().list();
  const pending = invites.filter((invite) => !invite.usedAt).length;

  return (
    <main className="flex flex-col gap-5 pt-2 lg:pt-6">
      <PageHeader
        title="Invitations"
        subtitle="Invite clients after their consultation, retainer and payment. Each link works once."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <section className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-foreground">Invite a client</h2>
            <p className="text-sm text-muted-foreground">
              They&apos;ll get a link to create their account and start their intake.
            </p>
          </div>

          {created ? (
            <div role="status" className="flex flex-col gap-2 rounded-lg bg-lime-soft px-5 py-4">
              <p className="text-base font-semibold text-foreground">Invitation ready for {created.name ?? created.email}</p>
              <p className="text-sm text-foreground">
                Send this link to {created.email}. It works once.
              </p>
              <div className="flex flex-wrap items-center gap-3 rounded-full bg-card px-4 py-2">
                <code className="min-w-0 flex-1 truncate text-sm">/invite/{created.token}</code>
                <CopyLinkButton path={`/invite/${created.token}`} />
              </div>
            </div>
          ) : null}

          <form action={createInvite} noValidate className="flex flex-col gap-6">
            <FormField name="name" label="Full name" defaultValue={read("name")} placeholder="As shown on passport" />
            <FormField name="email" label="Email address" type="email" defaultValue={read("email")} placeholder="client@example.com" />
            <div className="flex flex-col gap-2">
              <Label htmlFor="applicationType">Application type</Label>
              <Select id="applicationType" name="applicationType" defaultValue={APPLICATION_TYPES[0]}>
                {APPLICATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="h-12 self-start rounded-full px-8 font-semibold">
              Create invitation
            </Button>
          </form>
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">How invitations work</h2>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-foreground">
            <li>Invite the client once their retainer and payment are in.</li>
            <li>They open the link and create their account (name, password).</li>
            <li>Their intake and document checklist appear in All clients.</li>
          </ol>
          <p className="text-xs text-muted-foreground">
            Links work once. If a client loses theirs, create a new invitation.
          </p>
        </section>
      </div>

      <DataTable
        title="Sent invitations"
        meta={`${pending} pending`}
        columns={["Client", "Application", "Sent", "Status", "Action"]}
        emptyMessage="No invitations yet."
        rows={invites.map((invite) => {
          const account = invite.usedAt ? getMockAuthStore().findByEmail(invite.email) : undefined;
          return {
            key: invite.token,
            cells: [
              <span key="client" className="flex flex-col">
                <span>{invite.name ?? "—"}</span>
                <span className="text-muted-foreground">{invite.email}</span>
              </span>,
              invite.applicationType,
              formatTimeAgo(invite.createdAt),
              <StatusPill key="status" tone={invite.usedAt ? "filled" : "outline"}>
                {invite.usedAt ? "Accepted" : "Pending"}
              </StatusPill>,
              invite.usedAt ? (
                account ? (
                  <ArrowLink key="open" href={`/admin/${account.id}`}>
                    Open profile
                  </ArrowLink>
                ) : (
                  "—"
                )
              ) : (
                <CopyLinkButton key="copy" path={`/invite/${invite.token}`} />
              ),
            ],
          };
        })}
      />
    </main>
  );
}
