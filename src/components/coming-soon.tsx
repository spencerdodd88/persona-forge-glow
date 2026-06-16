import type { LucideIcon } from "lucide-react";

type Props = { icon: LucideIcon; eyebrow: string; title: string; description: string };

export function ComingSoon({ icon: Icon, eyebrow, title, description }: Props) {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-up">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
      <h1 className="font-display text-4xl md:text-5xl mt-1">{title}</h1>

      <div className="mt-10 glass-card rounded-2xl p-12 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-luxe flex items-center justify-center">
          <Icon className="w-7 h-7 text-primary-foreground" />
        </div>
        <div className="mt-5 font-display text-2xl text-gradient-gold">In the workshop</div>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">{description}</p>
      </div>
    </div>
  );
}
