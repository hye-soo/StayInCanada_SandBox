export interface ClientListRow {
  clientId: string;
  name: string;
  email: string;
  applicationId: string;
  // Display label, e.g. "Work permit" (from the client's profile).
  applicationType: string;
  stageLabel: string;
  nextAction: string;
  needsAttention: boolean;
  // Assigned to the signed-in staff member.
  assignedToMe: boolean;
}

export interface ClientListFilters {
  q?: string;
  applicationType?: string;
  status?: string;
  assigned?: string;
}

export const CLIENTS_PER_PAGE = 7;

// Figma "All clients": search by name, email or application ID, then
// narrow by application type, case status and "Assigned to me".
export function filterClientRows(rows: ClientListRow[], filters: ClientListFilters): ClientListRow[] {
  const needle = filters.q?.trim().toLowerCase();
  return rows.filter(
    (row) =>
      (!needle ||
        [row.name, row.email, row.applicationId].some((value) =>
          value.toLowerCase().includes(needle)
        )) &&
      (!filters.applicationType || row.applicationType === filters.applicationType) &&
      (filters.status !== "needs_attention" || row.needsAttention) &&
      (filters.assigned !== "me" || row.assignedToMe)
  );
}

// "Showing 7 of 24 clients • Page 1 of 4".
export function paginate<T>(items: T[], page: number, perPage: number = CLIENTS_PER_PAGE) {
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  return { items: items.slice((current - 1) * perPage, current * perPage), page: current, pageCount };
}
