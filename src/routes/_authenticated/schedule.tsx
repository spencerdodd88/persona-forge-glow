import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_authenticated/schedule")({
  head: () => ({ meta: [{ title: "Schedule · GenFluence" }] }),
  component: () => (
    <ComingSoon icon={CalendarClock} eyebrow="Coming soon" title="Schedule"
      description="Plan and auto-publish posts across platforms." />
  ),
});
