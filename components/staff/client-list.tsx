import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ClientSummary } from "@/lib/client-directory.ts";
import type { ChecklistItemStatus } from "@/lib/types.ts";

interface ClientListProps {
  clients: ClientSummary[];
  basePath: "/admin" | "/rcic";
  // Which checklist status count this role cares most about — Admin
  // triages "submitted", RCIC triages "under_review".
  highlightStatus: ChecklistItemStatus;
  highlightLabel: string;
}

// Shared by both /admin and /rcic (docs/DECISIONS.md 2026-10-26) — same
// list layout for both roles, mounted at each role's own route so
// requireRole still gates access independently per role.
export function ClientList({
  clients,
  basePath,
  highlightStatus,
  highlightLabel,
}: ClientListProps) {
  if (clients.length === 0) {
    return <p className="text-sm text-muted-foreground">No clients yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {clients.map((client) => (
        <li key={client.clientId}>
          <Card>
            <CardHeader>
              <CardTitle>Client {client.clientId}</CardTitle>
              <CardDescription>
                {client.visaTypeLabel} · {client.stage.label} · Intake{" "}
                {client.questionnaireComplete}/{client.questionnaireTotal}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {client.checklistCounts[highlightStatus]} {highlightLabel}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                render={<Link href={`${basePath}/${client.clientId}`}>View client</Link>}
              />
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  );
}
