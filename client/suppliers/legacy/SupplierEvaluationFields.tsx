// Formulário, critérios, cores e barras adaptados de SupplierEvaluations.tsx (8b5c9409).
import {useState} from 'react';
import {Input} from '../../sge/components/ui/input.tsx';
import {Label} from '../../sge/components/ui/label.tsx';
import {Textarea} from '../../sge/components/ui/textarea.tsx';
import {Slider} from '../../sge/components/ui/slider.tsx';
import {Card,CardHeader,CardTitle,CardContent} from '../../sge/components/ui/card.tsx';
import {Star,Calendar,TrendingUp,TrendingDown} from 'lucide-react';
import {evaluationCriteria as kpiLabels,overallScore,type EvaluationPayload,type SupplierEvaluation} from '../../../shared/suppliers/reviews.ts';
const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
};

const getProgressColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
};


export function SupplierEvaluationFields({initial,busy,onSave,onEdited}:{initial?:EvaluationPayload;busy:boolean;onEdited?:()=>void;onSave:(v:Omit<EvaluationPayload,'overallScore'>,reason:string)=>void}){const [formData,setFormData]=useState(initial??{evaluationPeriod:'',qualityScore:70,deliveryScore:70,priceScore:70,communicationScore:70,complianceScore:70,strengths:'',improvements:'',comments:'',evidence:''});const calculateOverall=()=>overallScore(formData);return <form onSubmit={e=>{e.preventDefault();const {overallScore:_,...data}=formData as EvaluationPayload;onSave(data,String(new FormData(e.currentTarget).get('reason')));}}>
              <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Período de Avaliação *</Label>
                  <Input aria-label="Período de Avaliação" required
                    value={formData.evaluationPeriod}
                    onChange={(e) => setFormData((prev) => ({ ...prev, evaluationPeriod: e.target.value }))}
                    placeholder="Ex: Q4 2024, Janeiro 2025, etc."
                  />
                </div>

                <div className="grid gap-6">
                  {Object.entries(kpiLabels).map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>{label}</Label>
                        <span className={`font-bold ${getScoreColor(formData[key as keyof typeof formData] as number)}`}>
                          {formData[key as keyof typeof formData]}
                        </span>
                      </div>
                      <Slider aria-label={label}
                        value={[formData[key as keyof typeof formData] as number]}
                        onValueChange={value=>{onEdited?.();setFormData(prev=>({...prev,[key]:value[0]}));}}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Pontuação Geral</span>
                    <span className={`text-2xl font-bold ${getScoreColor(calculateOverall())}`}>
                      {calculateOverall()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pontos Fortes</Label>
                  <Textarea aria-label="Pontos Fortes"
                    value={formData.strengths}
                    onChange={(e) => setFormData((prev) => ({ ...prev, strengths: e.target.value }))}
                    placeholder="Descreva os pontos fortes do fornecedor..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pontos de Melhoria</Label>
                  <Textarea aria-label="Pontos de Melhoria"
                    value={formData.improvements}
                    onChange={(e) => setFormData((prev) => ({ ...prev, improvements: e.target.value }))}
                    placeholder="Descreva os pontos que precisam de melhoria..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Comentários Adicionais</Label>
                  <Textarea aria-label="Comentários Adicionais"
                    value={formData.comments}
                    onChange={(e) => setFormData((prev) => ({ ...prev, comments: e.target.value }))}
                    placeholder="Observações gerais..."
                    rows={2}
                  />
                </div>
              </div>

<label>Evidência objetiva da avaliação<textarea aria-label="Evidência objetiva da avaliação" value={formData.evidence} required maxLength={6000} onChange={e=>setFormData(p=>({...p,evidence:e.target.value}))}/></label><label>Justificativa da avaliação<input aria-label="Justificativa da avaliação" name="reason" required/></label><p>Notas não geram multa, desconto, sanção disciplinar ou pagamento automático.</p><button disabled={busy}>Salvar Avaliação</button></form>;}
export function SupplierEvaluationSummary({evaluation:e}:{evaluation:SupplierEvaluation}){return <Card><CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4"/>{e.payload.evaluationPeriod}</CardTitle><p>{e.status==='void'?'Anulada':'Ativa'} · revisão {e.revision} · autor {e.createdBy}</p></CardHeader><CardContent><div className="flex gap-1"><Star className="h-5 w-5 text-yellow-500"/><span className={'text-2xl font-bold '+getScoreColor(e.payload.overallScore)}>Pontuação geral {e.payload.overallScore}</span></div><div className="grid grid-cols-5 gap-2 my-3">{Object.entries(kpiLabels).map(([key,label])=>{const value=e.payload[key as keyof typeof kpiLabels];return <div key={key} className="text-center"><p>{label}</p><div className="h-2 bg-muted rounded overflow-hidden"><div className={getProgressColor(value)+' h-full'} style={{width:value+'%'}}/></div><p className={getScoreColor(value)}>{value}</p></div>;})}</div><div className="grid grid-cols-2 gap-4">{e.payload.strengths&&<div><p className="flex gap-1 text-green-600"><TrendingUp className="h-3 w-3"/>Pontos Fortes</p><p>{e.payload.strengths}</p></div>}{e.payload.improvements&&<div><p className="flex gap-1 text-orange-600"><TrendingDown className="h-3 w-3"/>Melhorias</p><p>{e.payload.improvements}</p></div>}</div><p>{e.payload.comments}</p><p>Evidência: {e.payload.evidence}</p></CardContent></Card>;}

