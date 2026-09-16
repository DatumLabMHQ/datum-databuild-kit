// Says when the numbers cannot be trusted yet: sample data (no platform key) or a draft
// (brief not signed off, reconciliation not logged). Nothing renders once the page is live.
import { FlaskConicalIcon, TriangleAlertIcon } from 'lucide-react';
import { config } from '@/datum.config';
import { platformStatus } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export async function StatusBanner() {
  const s = await platformStatus();
  if (s.sample) {
    return (
      <Alert className="border-(--brand-blue)/30 bg-(--brand-blue)/5">
        <FlaskConicalIcon />
        <AlertTitle>Sample data</AlertTitle>
        <AlertDescription>No platform key is set, so every number on this page is generated and labelled as such. Set DATUM_API_KEY to read the Datum data platform.</AlertDescription>
      </Alert>
    );
  }
  if (config.status === 'draft') {
    return (
      <Alert className="border-(--yellow)/40 bg-(--yellow)/8">
        <TriangleAlertIcon />
        <AlertTitle>Draft</AlertTitle>
        <AlertDescription>Numbers are live from the platform, but the brief is not signed off and the reconciliation is not logged. Do not embed or share yet.</AlertDescription>
      </Alert>
    );
  }
  return null;
}
