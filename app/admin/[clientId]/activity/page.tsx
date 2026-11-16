import { getActivityLogStore } from "@/lib/activity-log-store.ts";
import { ActivityList } from "@/components/patterns/activity-list";
import { ContentCard } from "@/components/patterns/content-card";

// Activity tab: the full case activity log, newest first.
export default async function AdminClientActivityPage({ params }: PageProps<"/admin/[clientId]/activity">) {
  const { clientId } = await params;
  return (
    <ContentCard title="Case activity">
      <ActivityList
        entries={getActivityLogStore().getForClient(clientId)}
        emptyMessage="Nothing has happened on this case yet."
      />
    </ContentCard>
  );
}
