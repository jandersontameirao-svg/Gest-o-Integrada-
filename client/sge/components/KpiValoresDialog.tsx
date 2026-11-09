import {FinancialKpiSeries} from '../../strategy/FinancialKpiSeries.tsx';
import {KpiEvolutionChart} from './KpiEvolutionChart.tsx';
import {useStrategy} from "../../strategy/context.tsx";
import { useState, useEffect } from "react";
import { trpc } from "../../strategy/legacy.tsx";
import { Button } from "./ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select.tsx";
import { Card, CardContent } from "./ui/card.tsx";
import { toast } from "sonner";


interface KpiValoresDialogProps {
  kpiId: string;
  kpiNome: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const meses = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export default function KpiValoresDialog({
  kpiId,
  kpiNome,
  open,
  onOpenChange,
}: KpiValoresDialogProps) {
  const {data,token}=useStrategy();
  const [seriesSource,setSeriesSource]=useState<'manual'|'financial'>('manual');useEffect(()=>{setSeriesSource('manual');},[kpiId,open,token]);
  const currentYear = Math.min(Math.max(new Date().getFullYear(),data.plan.start_year),data.plan.end_year);
  const currentMonth = new Date().getMonth() + 1;

  const [ano, setAno] = useState(currentYear);
  const [mes, setMes] = useState(currentMonth);
  const [meta, setMeta] = useState("");
  const [realizado, setRealizado] = useState("");

  const { data: valores, refetch: refetchValores } = trpc.kpiValores.listByKpi.useQuery(
    { kpiId },
    { enabled: open }
  );

  const { data: valorAtual, refetch: refetchValorAtual } = trpc.kpiValores.getByPeriodo.useQuery(
    { kpiId, ano, mes },
    { enabled: open }
  );

  const upsertValor = trpc.kpiValores.upsert.useMutation({
    onSuccess: () => {
      refetchValores();
      refetchValorAtual();
      setMeta("");
      setRealizado("");
    },
    onError: (error) => {
      toast.error(`Erro ao registrar valor: ${error.message}`);
    },
  });

  useEffect(() => {
    if (valorAtual && 'meta' in valorAtual) {
      setMeta(valorAtual.meta!==null ? parseFloat(String(valorAtual.meta)).toString() : "");
      setRealizado('realizado' in valorAtual && valorAtual.realizado!==null ? parseFloat(String(valorAtual.realizado)).toString() : "");
    } else {
      setMeta("");
      setRealizado("");
    }
  }, [valorAtual]);

  const financialBound=(data.financialBindings??[]).some(b=>b.kpiId===kpiId&&b.periodStart.slice(0,7)===String(ano)+'-'+String(mes).padStart(2,'0'));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(financialBound){toast.error('Competência vinculada a apuração financeira; use o fluxo de revisão.');return;}
    upsertValor.mutate({
      kpiId,
      ano,
      mes,
      meta: meta ? parseFloat(meta) : undefined,
      realizado: realizado ? parseFloat(realizado) : undefined,
    });
  };

  const getStatusRagColor = (status: string | null) => {
    if (!status) return "bg-gray-200";
    if (status === "verde") return "bg-green-500";
    if (status === "amarelo") return "bg-yellow-500";
    if (status === "vermelho") return "bg-red-500";
    return "bg-gray-200";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lançamento de Valores - {kpiNome}</DialogTitle>
          <DialogDescription>
            Registre as metas e valores realizados mensalmente para acompanhar o desempenho do KPI.
          </DialogDescription>
        </DialogHeader>

        <label>Origem da série do KPI<select aria-label="Origem da série do KPI" value={seriesSource} onChange={e=>setSeriesSource(e.target.value as 'manual'|'financial')}><option value="manual">Observações manuais</option><option value="financial">Apurações financeiras aprovadas</option></select></label>
        {seriesSource==='financial'?<FinancialKpiSeries key={kpiId} kpiId={kpiId}/>:<>
        {financialBound&&<p role="status">Competência vinculada a apuração financeira. Edição manual bloqueada; use o fluxo de revisão financeira.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulário de Lançamento */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ano">Ano</Label>
                  <Select
                    value={ano.toString()}
                    onValueChange={(value) => setAno(parseInt(value))}
                  >
                    <SelectTrigger id="ano">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length:data.plan.end_year-data.plan.start_year+1},(_,i)=>data.plan.start_year+i).map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mes">Mês</Label>
                  <Select
                    value={mes.toString()}
                    onValueChange={(value) => setMes(parseInt(value))}
                  >
                    <SelectTrigger id="mes">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meses.map((m) => (
                        <SelectItem key={m.value} value={m.value.toString()}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta">Meta</Label>
                <Input
                  id="meta" disabled={financialBound||!data.capabilities.edit||data.plan.status!=='draft'}
                  type="number"
                  step="0.01"
                  placeholder="Digite a meta"
                  value={meta}
                  onChange={(e) => setMeta(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="realizado">Realizado</Label>
                <Input
                  id="realizado" disabled={financialBound||!data.capabilities.edit||data.plan.status==='closed'}
                  type="number"
                  step="0.01"
                  placeholder="Digite o valor realizado"
                  value={realizado}
                  onChange={(e) => setRealizado(e.target.value)}
                />
              </div>

              {valorAtual && 'percentualAtingimento' in valorAtual && valorAtual.percentualAtingimento && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Percentual de Atingimento</p>
                        <p className="text-2xl font-bold">
                          {parseFloat(String(valorAtual.percentualAtingimento)).toFixed(1)}%
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full ${getStatusRagColor('statusRag' in valorAtual ? valorAtual.statusRag : null)}`}
                        title={`Status: ${'statusRag' in valorAtual ? valorAtual.statusRag : 'N/A'}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={financialBound||upsertValor.isPending||!data.capabilities.edit||data.plan.status==='closed'}>
                  {upsertValor.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </div>

          {/* Gráfico de Evolução */}
          <div>
            <h3 className="font-semibold mb-4">Evolução Temporal</h3>
            {valores && valores.length > 0 ? (
              <div className="mb-6">
                <KpiEvolutionChart points={valores.slice().reverse().map(v=>({period:v.ano+'-'+String(v.mes).padStart(2,'0'),label:`${meses.find(m=>m.value===v.mes)?.label.substring(0,3)}/${v.ano}`,meta:v.meta,actual:v.realizado}))}/>

              </div>
            ) : null}
            
            <h3 className="font-semibold mb-4 mt-6">Histórico de Valores</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {valores && valores.length > 0 ? (
                valores.map((valor) => (
                  <Card key={valor.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {meses.find((m) => m.value === valor.mes)?.label}/{valor.ano}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Meta: {valor.meta ? parseFloat(valor.meta).toFixed(2) : "-"} | Realizado:{" "}
                          {valor.realizado ? parseFloat(valor.realizado).toFixed(2) : "-"}
                        </p>
                        {valor.percentualAtingimento && (
                          <p className="text-sm font-medium">
                            {parseFloat(valor.percentualAtingimento).toFixed(1)}% de atingimento
                          </p>
                        )}
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusRagColor(valor.statusRag)}`}
                        title={`Status: ${valor.statusRag}`}
                      />
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum valor registrado ainda
                </p>
              )}
            </div>
          </div>
        </div>
        </>}
      </DialogContent>
    </Dialog>
  );
}
