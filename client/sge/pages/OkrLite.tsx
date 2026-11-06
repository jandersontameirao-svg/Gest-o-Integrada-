import {ReadOnly} from "../../strategy/context.tsx";
import PendingFeature from "../components/PendingFeature.tsx";
import {useDocument} from "../../strategy/context.tsx";
import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "../../strategy/legacy.tsx";
import { Button } from "../components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.tsx";
import { Slider } from "../components/ui/slider.tsx";
import { Badge } from "../components/ui/badge.tsx";
import { Save, Plus, Trash2, Target, CheckCircle2, FileDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

interface KeyResult {
  id: string;
  descricao: string;
  meta: number;
  atual: number;
}

interface OKR {
  id: string;
  objetivo: string;
  keyResults: KeyResult[];
}

interface OkrLiteProps {
  empresaId: string;
}

// Helper para converter config do banco para formato de exportação
function convertTemplateConfig(config: any) {
  if (!config) return undefined;
  return {
    corPrimaria: config.corPrimaria,
    corSecundaria: config.corSecundaria,
    rodapePersonalizado: config.rodapePersonalizado || undefined,
  };
}

function OkrLite({ empresaId }: OkrLiteProps) {
  const {value:okrs,setValue:setOkrs,status:autoSaveStatus,save}=useDocument<OKR[]>("okr",[]);
  const hasUserChanges={current:false};
  const manualSaveSuccess=autoSaveStatus==='saved';
  const salvarMutation={isPending:autoSaveStatus==='saving'};
  const [novoObjetivo, setNovoObjetivo] = useState("");
  const [novoKR, setNovoKR] = useState({ okrId: "", descricao: "", meta: 100 });

  const adicionarOKR = () => {
    if (!novoObjetivo || novoObjetivo.trim() === "") {
      alert("Por favor, preencha o objetivo antes de adicionar.");
      return;
    }
    if (novoObjetivo.length < 10) {
      alert("O objetivo deve ter pelo menos 10 caracteres.");
      return;
    }
    hasUserChanges.current = true;
    setOkrs([...okrs, {
      id: crypto.randomUUID(),
      objetivo: novoObjetivo,
      keyResults: [],
    }]);
    setNovoObjetivo("");
  };

  const removerOKR = (id: string) => {
    hasUserChanges.current = true;
    setOkrs(okrs.filter((o) => o.id !== id));
  };

  const adicionarKR = (okrId: string) => {
    if (!novoKR.descricao || novoKR.descricao.trim() === "") {
      alert("Por favor, preencha a descrição do Key Result antes de adicionar.");
      return;
    }
    if (novoKR.descricao.length < 5) {
      alert("A descrição do Key Result deve ter pelo menos 5 caracteres.");
      return;
    }
    hasUserChanges.current = true;
    setOkrs(okrs.map((o) => {
      if (o.id === okrId) {
        return {
          ...o,
          keyResults: [...o.keyResults, {
            id: crypto.randomUUID(),
            descricao: novoKR.descricao,
            meta: novoKR.meta,
            atual: 0,
          }],
        };
      }
      return o;
    }));
    setNovoKR({ okrId: "", descricao: "", meta: 100 });
  };

  const removerKR = (okrId: string, krId: string) => {
    hasUserChanges.current = true;
    setOkrs(okrs.map((o) => {
      if (o.id === okrId) {
        return { ...o, keyResults: o.keyResults.filter((kr) => kr.id !== krId) };
      }
      return o;
    }));
  };

  const atualizarKR = (okrId: string, krId: string, atual: number) => {
    hasUserChanges.current = true;
    setOkrs(okrs.map((o) => {
      if (o.id === okrId) {
        return {
          ...o,
          keyResults: o.keyResults.map((kr) => (kr.id === krId ? { ...kr, atual } : kr)),
        };
      }
      return o;
    }));
  };

  const calcularProgressoOKR = (okr: OKR) => {
    if (okr.keyResults.length === 0) return 0;
    const total = okr.keyResults.reduce((acc, kr) => acc + (kr.meta>0 ? (kr.atual / kr.meta) * 100 : 0), 0);
    return Math.round(total / okr.keyResults.length);
  };

  const progressoGeral = okrs.length > 0
    ? Math.round(okrs.reduce((acc, okr) => acc + calcularProgressoOKR(okr), 0) / okrs.length)
    : 0;

  const dadosGrafico = okrs.map((okr) => ({
    nome: okr.objetivo.substring(0, 20) + (okr.objetivo.length > 20 ? "..." : ""),
    progresso: calcularProgressoOKR(okr),
  }));

  const dadosPie = [
    { name: "Concluído", value: progressoGeral },
    { name: "Restante", value: Math.max(0,100 - progressoGeral) },
  ];

  const handleSave = () => { void save(); };

  const getCorProgresso = (progresso: number) => {
    if (progresso >= 70) return "#22c55e";
    if (progresso >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 border-cyan-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white">
              <Target className="h-5 w-5" />
            </div>
            OKR - Objetivos e Resultados-Chave
          </CardTitle>
          <CardDescription>Defina objetivos ambiciosos e resultados mensuráveis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cyan-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-cyan-700">{okrs.length}</div>
              <div className="text-xs text-cyan-600">Objetivos</div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700">
                {okrs.reduce((acc, okr) => acc + okr.keyResults.length, 0)}
              </div>
              <div className="text-xs text-blue-600">Key Results</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700">{progressoGeral}%</div>
              <div className="text-xs text-green-600">Progresso Geral</div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-700">
                {okrs.filter((okr) => calcularProgressoOKR(okr) >= 70).length}
              </div>
              <div className="text-xs text-purple-600">No Alvo (≥70%)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      {okrs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progresso por Objetivo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dadosGrafico} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="nome" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="progresso">
                    {dadosGrafico.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCorProgresso(entry.progresso)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Progresso Geral</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={dadosPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill={getCorProgresso(progressoGeral)} />
                    <Cell fill="#e5e7eb" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <div className="text-3xl font-bold">{progressoGeral}%</div>
                <div className="text-xs text-gray-500">Completo</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de OKRs */}
      <div className="space-y-4">
        {okrs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Nenhum OKR definido ainda. Adicione um objetivo abaixo.
            </CardContent>
          </Card>
        ) : (
          okrs.map((okr) => {
            const progresso = calcularProgressoOKR(okr);
            return (
              <Card key={okr.id} className="border-l-4 border-cyan-400">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">{okr.objetivo}</h4>
                      <p className="text-xs text-gray-500">{okr.keyResults.length} Key Results</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${progresso >= 70 ? "bg-green-500" : progresso >= 40 ? "bg-yellow-500" : "bg-red-500"}`}>
                        {progresso}%
                      </Badge>
                      <button onClick={() => removerOKR(okr.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Key Results */}
                  <div className="space-y-3 mb-4">
                    {okr.keyResults.map((kr) => {
                      const krProgresso = Math.round((kr.meta>0 ? (kr.atual / kr.meta) * 100 : 0));
                      return (
                        <div key={kr.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className={`h-4 w-4 ${krProgresso >= 100 ? "text-green-500" : "text-gray-400"}`} />
                              <span className="text-sm">{kr.descricao}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold">{kr.atual}/{kr.meta}</span>
                              <button onClick={() => removerKR(okr.id, kr.id)} className="text-red-600 hover:text-red-800">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <Slider
                            value={[kr.atual]}
                            onValueChange={(val) => atualizarKR(okr.id, kr.id, val[0])}
                            min={0}
                            max={kr.meta}
                            step={1}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Adicionar KR */}
                  <div className="bg-cyan-50 p-3 rounded-lg">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={novoKR.okrId === okr.id ? novoKR.descricao : ""}
                        onChange={(e) => setNovoKR({ ...novoKR, okrId: okr.id, descricao: e.target.value })}
                        placeholder="Novo Key Result..."
                        className="flex-1 border rounded px-2 py-1 text-sm"
                      />
                      <input
                        type="number"
                        value={novoKR.okrId === okr.id ? novoKR.meta : 100}
                        onChange={(e) => setNovoKR({ ...novoKR, okrId: okr.id, meta: parseInt(e.target.value) || 100 })}
                        placeholder="Meta"
                        className="w-20 border rounded px-2 py-1 text-sm"
                      />
                      <Button size="sm" onClick={() => adicionarKR(okr.id)} className="bg-cyan-600 hover:bg-cyan-700">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Novo OKR */}
      <Card className="bg-cyan-50 border-cyan-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Adicionar Novo Objetivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="text"
            value={novoObjetivo}
            onChange={(e) => setNovoObjetivo(e.target.value)}
            placeholder="Ex: Aumentar a satisfação do cliente em 20%..."
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <Button onClick={adicionarOKR} className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4" />
            Adicionar Objetivo
          </Button>
        </CardContent>
      </Card>

      {/* Indicador de Auto-Save */}
      {autoSaveStatus !== 'idle' && (
        <div className={`text-sm px-3 py-2 rounded-lg flex items-center gap-2 ${
          autoSaveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
          autoSaveStatus === 'saved' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {autoSaveStatus === 'saving' && <><span className="animate-spin">⏳</span> Salvando automaticamente...</>}
          {autoSaveStatus === 'saved' && <><span>✓</span> Salvo automaticamente!</>}
          {autoSaveStatus === 'error' && <><span>✕</span> Erro ao salvar. Tente manualmente.</>}
        </div>
      )}

      {/* Feedback de save manual */}
      {manualSaveSuccess && (
        <div className="text-sm px-3 py-2 rounded-lg flex items-center gap-2 bg-green-100 text-green-700 border border-green-300">
          <span>✓</span> OKR salva com sucesso!
        </div>
      )}

      {/* Salvar e Exportar */}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="flex-1 gap-2 bg-cyan-600 hover:bg-cyan-700 text-white" disabled={salvarMutation.isPending}>
          <Save className="h-4 w-4" />
          {salvarMutation.isPending ? 'Salvando...' : 'Salvar OKRs'}
        </Button>
        <Button 
          disabled title="PDF legado pendente de port. Use a exportação JSON autorizada do plano."
          variant="outline"
          className="gap-2"
        >
          <FileDown className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Comentários */}
      <PendingFeature />
    </div>
  );
}

export default function ScopedOkrLite(props:OkrLiteProps){return <ReadOnly><OkrLite {...props}/></ReadOnly>;}
