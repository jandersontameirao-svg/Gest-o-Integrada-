// Formulário adaptado de ContractAmendments.tsx, origem 8b5c9409. Sem tRPC, IA ou edição direta de status.
import {useState} from 'react';import {Button} from '../../sge/components/ui/button.tsx';import {Input} from '../../sge/components/ui/input.tsx';import {Label} from '../../sge/components/ui/label.tsx';import {Textarea} from '../../sge/components/ui/textarea.tsx';import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '../../sge/components/ui/select.tsx';import {Loader2,Save} from 'lucide-react';
import {cents,amount} from '../../../shared/contracts/model.ts';import type {AmendmentData} from '../../../shared/suppliers/lifecycle.ts';
export function SupplierAmendmentFields({initial,baseValue,busy,onSave,onCancel,onEdited}:{initial?:AmendmentData;baseValue:string;busy:boolean;onSave:(v:AmendmentData,reason:string)=>void;onCancel:()=>void;onEdited:()=>void}){
 const [title,setTitle]=useState(initial?.title??''),[number,setNumber]=useState(initial?.number??''),[amendmentType,setAmendmentType]=useState<AmendmentData['amendmentType']>(initial?.amendmentType??'financial'),[description,setDescription]=useState(initial?.description??''),[valueChange,setValueChange]=useState(initial?.valueChange??'0.00'),[newEndDate,setNewEndDate]=useState(initial?.newEndDate??''),[content,setContent]=useState(initial?.content??''),[notes,setNotes]=useState(initial?.notes??''),[effectiveDate,setEffectiveDate]=useState(initial?.effectiveDate??''),[scopeChanges,setScopeChanges]=useState(initial?.scopeChanges??''),[paymentTerms,setPaymentTerms]=useState(initial?.paymentTerms??'');let newTotalValue='';try{newTotalValue=amount(cents(baseValue)+cents(valueChange));}catch{}
 return <form onChange={onEdited} onSubmit={e=>{e.preventDefault();onSave({title,number,amendmentType,description,valueChange,newTotalValue,newEndDate,content,notes,effectiveDate,scopeChanges,paymentTerms},String(new FormData(e.currentTarget).get('reason')));}}>
<div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label>Título do Aditivo *</Label>
              <Input aria-label="Título do Aditivo" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Aditivo nº 1 - Reajuste de Valor" />
            </div>
            <div className="space-y-1">
              <Label>Número</Label>
              <Input aria-label="Número do Aditivo" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Ex: ADT-001" />
            </div>
            <div className="space-y-1">
              <Label>Tipo *</Label>
              <Select value={amendmentType} onValueChange={v=>{onEdited();setAmendmentType(v as AmendmentData['amendmentType']);if(!['financial','mixed'].includes(v))setValueChange('0.00');}}>
                <SelectTrigger aria-label="Tipo do Aditivo"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financeiro</SelectItem>
                  <SelectItem value="scope">Escopo</SelectItem>
                  <SelectItem value="term">Prazo</SelectItem>
                  <SelectItem value="mixed">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label>Nova Data de Término</Label>
              <Input type="date" aria-label="Nova Data de Término" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
            </div>
            {(amendmentType === "financial" || amendmentType === "mixed") && (
              <>
                <div className="space-y-1">
                  <Label>Variação de Valor — moeda do contrato</Label>
                  <Input type="number" step="0.01" aria-label="Variação de Valor" value={valueChange} onChange={(e) => setValueChange(e.target.value)} placeholder="Ex: 50000.00" />
                </div>
                <div className="space-y-1">
                  <Label>Novo Valor Total — calculado</Label>
                  <Input type="number" step="0.01" aria-label="Novo Valor Total" value={newTotalValue} readOnly placeholder="Ex: 250000.00" />
                </div>
              </>
            )}
            <div className="col-span-2 space-y-1">
              <Label>Descrição</Label>
              <Textarea aria-label="Descrição do Aditivo" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Descreva o objeto deste aditivo..." />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Conteúdo / Cláusulas</Label>
              <Textarea aria-label="Conteúdo / Cláusulas do Aditivo" value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Texto completo do aditivo..." />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Observações</Label>
              <Textarea aria-label="Observações do Aditivo" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notas internas..." />
            </div>
          </div>
        </div>
        <label>Vigência do Aditivo<input aria-label="Vigência do Aditivo" type="date" value={effectiveDate} onChange={e=>setEffectiveDate(e.target.value)} required/></label><label>Objeto consolidado após aditivo<textarea aria-label="Objeto consolidado após aditivo" value={scopeChanges} onChange={e=>setScopeChanges(e.target.value)}/></label><label>Condições de pagamento revisadas<textarea aria-label="Condições de pagamento revisadas" value={paymentTerms} onChange={e=>setPaymentTerms(e.target.value)}/></label><label>Justificativa do Aditivo<input name="reason" required/></label><p>Sem alteração automática de preços de OS, faturamento ou quitação. Aprovação e aplicação são decisões separadas.</p><div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            {initial ? "Salvar Alterações" : "Criar Aditivo"}
          </Button>
        </div>
</form>;}
