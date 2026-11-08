// Adaptado substancialmente de UTU operacao.tsx ContaFormDialog, c63ad1c260cabfb3f5276ad7db4bf3e43b68016f.
// Mantém blocos e fluxo; dados/validação/persistência passam à GI. Sem tRPC, storage ou autenticação legados.
import {useState} from 'react';import {Input} from '../../sge/components/ui/input.tsx';import {Label} from '../../sge/components/ui/label.tsx';import {Textarea} from '../../sge/components/ui/textarea.tsx';import {Button} from '../../sge/components/ui/button.tsx';import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '../../sge/components/ui/select.tsx';import {frequencies,type TitleData,type Category,type Bucket,type Account} from '../../../shared/finance/model.ts';
export function FinanceTitleFields({initial,bucket,categories,accounts,contacts,projects,contracts,dimensions,busy,onSave,onCancel,onEdited}:{initial?:TitleData;bucket:Bucket;categories:Category[];accounts:Account[];contacts:{id:string;name:string}[];projects:{id:string;name:string}[];contracts:{id:string;name:string}[];dimensions:{id:string;kind:string;name:string;active:boolean}[];busy:boolean;onEdited:()=>void;onSave:(data:TitleData,series:unknown,reason:string)=>void;onCancel:()=>void}){
 const isPagar=bucket!=='income',kind=isPagar?'pagar':'receber',editing=!!initial,[mais,setMais]=useState(!!initial),[f,setF]=useState({contactId:initial?.contactId??'',category:initial?.categoryId??'',description:initial?.description??'',amount:initial?.amount??'',currency:initial?.currency??'BRL',dueDate:initial?.dueDate??'',notes:initial?.notes??'',competenceDate:initial?.competenceDate??'',projectId:initial?.projectId??'',contractId:initial?.contractId??'',documentNumber:initial?.documentNumber??'',accountId:initial?.accountId??'',paymentMethod:initial?.paymentMethod??'',costCenterId:initial?.costCenterId??'',tagIds:initial?.tagIds??[],recorrente:false,recurrence:'monthly',fortnightDays:'',installments:'3',seriesMode:'installments' as 'installments'|'recurrence'});
 const set=(patch:Partial<typeof f>)=>{onEdited();setF(s=>({...s,...patch}));},catOptions=categories.filter(c=>c.active&&c.bucket===bucket),entidades=contacts,projetos=projects;
 const submit=(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();onSave({description:f.description,bucket,amount:f.amount,currency:f.currency,dueDate:f.dueDate,competenceDate:f.competenceDate||f.dueDate,categoryId:f.category||null,accountId:f.accountId||null,contactId:f.contactId||null,projectId:f.projectId||null,contractId:f.contractId||null,documentNumber:f.documentNumber,paymentMethod:f.paymentMethod,costCenterId:f.costCenterId||null,tagIds:f.tagIds,notes:f.notes},!editing&&f.recorrente?{mode:f.seriesMode,count:Number(f.installments),frequency:f.recurrence,...(f.recurrence==='fortnightly'?{fortnightDays:Number(f.fortnightDays)}:{})}:undefined,String(new FormData(e.currentTarget).get('reason')));};
 return (
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>{isPagar ? "Fornecedor ou beneficiário" : "Cliente ou pagador"}</Label>
              <Select value={f.contactId || "none"} onValueChange={(v) => set({ contactId: v === "none" ? "" : v })}>
                <SelectTrigger aria-label="Contato canônico" className="mt-1.5"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não informar</SelectItem>
                  {entidades.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Vem do cadastro de {isPagar ? "fornecedores" : "clientes"} — não se cria entidade aqui.
              </p>
            </div>
            <div>
              <Label>Categoria *</Label>
              <Select value={f.category} onValueChange={(v) => set({ category: v })}>
                <SelectTrigger aria-label="Categoria" className="mt-1.5"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{catOptions.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Descrição *</Label>
              <Input className="mt-1.5" aria-label="Descrição" value={f.description} onChange={(e) => set({ description: e.target.value })}
                placeholder={isPagar ? "Ex.: Aluguer do escritório — agosto" : "Ex.: Parcela de consultoria — agosto"} />
            </div>
            <div>
              <Label>Valor *</Label>
              <div className="mt-1.5 flex gap-1.5">
                <select value={f.currency} onChange={(e) => set({ currency: e.target.value as any })}
                  className="h-9 rounded-md border border-border bg-background px-2 text-xs font-medium" title="Moeda do registo" aria-label="Moeda">
                  <option value="MZN">MTn</option>
                  <option value="BRL">R$</option>
                </select>
                <Input type="number" step="0.01" min="0" placeholder="0,00" className="flex-1"
                  aria-label="Valor" value={f.amount} onChange={(e) => set({ amount: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>{isPagar ? "Data de vencimento *" : "Data prevista de recebimento *"}</Label>
              <Input type="date" className="mt-1.5" aria-label="Vencimento" value={f.dueDate} onChange={(e) => set({ dueDate: e.target.value })} />
            </div>
            <div className="sm:col-span-2"><Label>Documento / referência</Label><Input aria-label="Documento / referência" value={f.documentNumber} onChange={e=>set({documentNumber:e.target.value})}/><p>Anexos privados serão incorporados em incremento específico; nenhuma URL pública é aceita.</p></div>
            <div className="sm:col-span-2">
              <Label>Observação</Label>
              <Textarea rows={2} className="mt-1.5" placeholder="Opcional" aria-label="Observação" value={f.notes} onChange={(e) => set({ notes: e.target.value })} />
            </div>
          </div>

          {!editing && (
            <div className="rounded-lg border border-border/60 p-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary" checked={f.recorrente} onChange={(e) => set({ recorrente: e.target.checked })} />
                Parcelar ou repetir este lançamento
              </label>
              {f.recorrente && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label>Plano de pagamento<select aria-label="Plano de pagamento" value={f.seriesMode} onChange={e=>set({seriesMode:e.target.value as "installments"|"recurrence"})}><option value="installments">Dividir o valor total em parcelas</option><option value="recurrence">Repetir o valor por ocorrência</option></select></label>{f.recurrence==='fortnightly'&&<label>Intervalo quinzenal<select aria-label="Intervalo quinzenal" value={f.fortnightDays} required onChange={e=>set({fortnightDays:e.target.value})}><option value="">Selecione a regra</option><option value="14">A cada 14 dias</option><option value="15">A cada 15 dias</option></select></label>}<Label>Periodicidade</Label>
                    <Select value={f.recurrence} onValueChange={(v: any) => set({ recurrence: v })}>
                      <SelectTrigger aria-label="Frequência" className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(frequencies).map(([id,label])=><SelectItem key={id} value={id}>{label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Número de ocorrências</Label>
                    <Input type="number" min="2" max="120" className="mt-1.5" aria-label="Número de ocorrências" value={f.installments} onChange={(e) => set({ installments: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* §11 — campos de exceção ficam recolhidos, para não sobrecarregar a criação. */}
          <div className="rounded-lg border border-border/60">
            <button type="button" onClick={() => setMais((m) => !m)} className="w-full text-left px-3 py-2 text-sm font-medium text-foreground">
              {mais ? "▾" : "▸"} Mais opções
            </button>
            {mais && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-3 pb-3">
                <div>
                  <Label>Competência</Label>
                  <Input type="date" className="mt-1.5" aria-label="Competência" value={f.competenceDate} onChange={(e) => set({ competenceDate: e.target.value })} />
                  <p className="text-[10px] text-muted-foreground mt-1">Se vazia, vale o mês do vencimento.</p>
                </div>
                <div>
                  <Label>Projeto relacionado</Label>
                  <Select value={f.projectId || "none"} onValueChange={(v) => set({ projectId: v === "none" ? "" : v })}>
                    <SelectTrigger aria-label="Projeto relacionado" className="mt-1.5"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {(projetos as any[]).map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">Opcional. Vem da Gestão de Projetos.</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-muted/40 border border-border/60 px-3 py-2 text-xs text-muted-foreground">
            Estado inicial: <strong className="text-foreground">Rascunho, aguardando aprovação</strong> · valor liquidado 0 ·
            {isPagar ? " o pagamento é uma etapa posterior." : " o recebimento é uma etapa posterior."}
          </div>


<label>Conta prevista<select aria-label="Conta prevista" value={f.accountId} onChange={e=>set({accountId:e.target.value})}><option value="">Não informar</option>{accounts.filter(a=>a.active&&a.currency===f.currency).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label><label>Forma de pagamento prevista<input aria-label="Forma de pagamento prevista" value={f.paymentMethod} onChange={e=>set({paymentMethod:e.target.value})}/></label><label>Contrato relacionado<select aria-label="Contrato relacionado" value={f.contractId} onChange={e=>set({contractId:e.target.value})}><option value="">Nenhum</option>{contracts.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
<label>Centro de custo<select aria-label="Centro de custo" value={f.costCenterId} onChange={e=>set({costCenterId:e.target.value})}><option value="">Nenhum</option>{dimensions.filter(d=>d.kind==='cost_center'&&d.active).map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
<label>Marcadores<select aria-label="Marcadores" multiple value={f.tagIds} onChange={e=>set({tagIds:[...e.target.selectedOptions].map(o=>o.value)})}>{dimensions.filter(d=>d.kind==='tag'&&d.active).map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
<label>Justificativa do lançamento<textarea aria-label="Justificativa do lançamento" name="reason" required maxLength={3000}/></label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" className="primary" disabled={busy}>
              {busy ? "A guardar..." : editing ? "Guardar alterações" : "Guardar conta"}
            </Button>
          </div>
        </form>
 );
}
