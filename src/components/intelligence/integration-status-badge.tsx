import { Badge } from "@/components/ui/badge";
import { INTEGRATION_STATUS_LABEL, type IntegrationStatus } from "@/lib/enums";

const TONE: Record<IntegrationStatus, "success" | "neutral" | "warning" | "accent"> = {
  CONNECTED: "success",
  NOT_CONNECTED: "neutral",
  REQUIRES_API: "warning",
  REQUIRES_USER_AUTH: "accent",
};

export function IntegrationStatusBadge({ status }: { status: IntegrationStatus | string }) {
  const s = status as IntegrationStatus;
  return <Badge tone={TONE[s] ?? "neutral"}>{INTEGRATION_STATUS_LABEL[s] ?? status}</Badge>;
}
