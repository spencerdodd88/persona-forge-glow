import { createFileRoute } from "@tanstack/react-router";
import { UsersRound } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_authenticated/friends")({
  head: () => ({ meta: [{ title: "Friends & Groups · GenFluence" }] }),
  component: () => (
    <ComingSoon icon={UsersRound} eyebrow="Coming soon" title="Friends & Groups"
      description="Collaborate with fellow creators and form influencer groups." />
  ),
});
