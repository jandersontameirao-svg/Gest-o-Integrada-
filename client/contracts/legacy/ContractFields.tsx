import {useState} from 'react';
import {Button} from '../../sge/components/ui/button.tsx';
import {Input} from '../../sge/components/ui/input.tsx';
import {Label} from '../../sge/components/ui/label.tsx';
import {Textarea} from '../../sge/components/ui/textarea.tsx';
import {Select,SelectTrigger,SelectContent,SelectValue,SelectItem} from '../../sge/components/ui/select.tsx';
import type {ContractPayload} from '../../../shared/contracts/model.ts';
export function ContractFields({initial,onSave,busy}:{initial:ContractPayload;onSave:(data:ContractPayload)=>void;busy:boolean}){const [contractFormData,setContractFormData]=useState(initial);return <form onSubmit={e=>{e.preventDefault();onSave(contractFormData);}}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Contrato *</Label>
                <Input
                  id="title"
                  value={contractFormData.title}
                  onChange={(e) => setContractFormData({ ...contractFormData, title: e.target.value })}
                  placeholder="Ex: Contrato de Prestação de Serviços"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  value={contractFormData.description}
                  onChange={(e) => setContractFormData({ ...contractFormData, description: e.target.value })}
                  placeholder="Descrição do contrato"
                  className="w-full border rounded px-3 py-2 h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalValue">Valor Base *</Label>
                  <Input
                    id="totalValue"
                    type="number"
                    value={contractFormData.totalValue}
                    onChange={(e) => setContractFormData({ ...contractFormData, totalValue: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={contractFormData.startDate}
                    onChange={(e) => setContractFormData({ ...contractFormData, startDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="endDate">Data de Término</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={contractFormData.endDate}
                  onChange={(e) => setContractFormData({ ...contractFormData, endDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="observations">Observações</Label>
                <textarea
                  id="observations"
                  value={contractFormData.observations}
                  onChange={(e) => setContractFormData({ ...contractFormData, observations: e.target.value })}
                  placeholder="Observações ou notas sobre o contrato"
                  className="w-full border rounded px-3 py-2 h-20"
                />
              </div>
            </div>
<div className="grid grid-cols-2 gap-3">{[['currency','Moeda ISO'],['legacyCode','Código legado'],['managerName','Gestor'],['managerEmail','E-mail do gestor'],['approverName','Aprovador cliente'],['approverEmail','E-mail do aprovador']].map(([key,label])=><label key={key}>{label}<Input aria-label={label} value={String(contractFormData[key as keyof ContractPayload])} onChange={e=>setContractFormData({...contractFormData,[key]:e.target.value})}/></label>)}</div>
<label>Estado contratual<select aria-label="Estado contratual" value={contractFormData.status} onChange={e=>setContractFormData({...contractFormData,status:e.target.value as ContractPayload['status']})}>{['draft','active','paused','completed','cancelled'].map(s=><option key={s}>{s}</option>)}</select></label>
<Button type="submit" disabled={busy}>Salvar contrato</Button></form>;}
