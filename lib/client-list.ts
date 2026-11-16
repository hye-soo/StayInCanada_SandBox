import type { VisaType } from "./types.ts";

export interface ClientListRow {
  clientId: string;
  name: string;
  email: string;
  applicationId: string;
  visaType: VisaType;
  visaTypeLabel: string;
  stageLabel: string;
  nextAction: string;
  needsAttention: boolean;
}

export interface ClientListFilters {
  q?: string;
  visaType?: string;
  status?: string;
}

// Figma "All clients": search by name, email or application ID, then
// narrow by application type and case status.
export function filterClientRows(rows: ClientListRow[], filters: ClientListFilters): ClientListRow[] {
  const needle = filters.q?.trim().toLowerCase();
  return rows.filter(
    (row) =>
      (!needle ||
        [row.name, row.email, row.applicationId].some((value) =>
          value.toLowerCase().includes(needle)
        )) &&
      (!filters.visaType || row.visaType === filters.visaType) &&
      (filters.status !== "needs_attention" || row.needsAttention)
  );
}
