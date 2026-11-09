// Reaproveitado de UTU operacao.tsx, c63ad1c260cabfb3f5276ad7db4bf3e43b68016f.
import {Card,CardContent} from '../../sge/components/ui/card.tsx';import {cn} from '../../sge/lib/utils.ts';
export function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "alert" | "info" | "good" }) {
  const bar = tone === "alert" ? "bg-red-500" : tone === "info" ? "bg-sky-500" : tone === "good" ? "bg-emerald-500" : "bg-slate-300";
  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className={cn("h-1 w-full", bar)} />
        <div className="p-4">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-display font-bold text-foreground mt-1">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

