import { createFileRoute } from "@tanstack/react-router";
import { DollarSign } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_authenticated/monetization")({
  head: () => ({ meta: [{ title: "Monetization · GenFluence" }] }),
  component: () => (
    <ComingSoon icon={DollarSign} eyebrow="Coming soon" title="Monetization"
      description="Subscriptions, tips, paid DMs — turn your influencers into revenue." />
  ),
});
