import { createFileRoute } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_authenticated/content-studio")({
  head: () => ({ meta: [{ title: "Content Studio · GenFluence" }] }),
  component: () => (
    <ComingSoon
      icon={ImageIcon}
      eyebrow="Coming soon"
      title="Content Studio"
      description="Generate photoshoots, captions, and stories for each of your influencers."
    />
  ),
});
