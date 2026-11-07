import {legalTextLimit} from '../../../shared/suppliers/legal.ts';
// Blocos Identification, Parties e Financial & Dates adaptados do ContractEditor original (8b5c9409).
import {useState} from 'react';
import {Input} from '../../sge/components/ui/input.tsx';
import {Label} from '../../sge/components/ui/label.tsx';
import {Textarea} from '../../sge/components/ui/textarea.tsx';
import {Select,SelectTrigger,SelectContent,SelectItem,SelectValue} from '../../sge/components/ui/select.tsx';
import type {ContractTerms} from '../../../shared/suppliers/operations.ts';
const contractTypeLabels={service:'Serviços',supply:'Fornecimento',lease:'Locação',consulting:'Consultoria',maintenance:'Manutenção',other:'Outro'};
export function SupplierContractFields({initial,companyName,supplierName,supplierCnpj,busy,onSave,lockedInstrumentText}:{initial?:ContractTerms;companyName:string;supplierName:string;supplierCnpj:string;busy:boolean;lockedInstrumentText?:string;onSave:(v:ContractTerms,reason:string)=>void}){
const [title,setTitle]=useState(initial?.title??''),[number,setNumber]=useState(initial?.reference??''),[contractType,setContractType]=useState(initial?.contractType??'service'),[object,setObject]=useState(initial?.object??''),[contractorRepresentative,setContractorRepresentative]=useState(initial?.representative??''),[totalValue,setTotalValue]=useState(initial?.totalValue??''),[startDate,setStartDate]=useState(initial?.startDate??''),[endDate,setEndDate]=useState(initial?.endDate??''),[paymentTerms,setPaymentTerms]=useState(initial?.paymentTerms??'');
return <form className="space-y-4" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);onSave({title,reference:number,contractType,object,totalValue,currency:String(f.get('currency')),startDate,endDate,paymentTerms,representative:contractorRepresentative,instrumentText:String(f.get('instrumentText'))},String(f.get('reason')));}}>
              {/* Identification */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</span>
                  Identificação
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="title">Título do Contrato *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Contrato de Prestação de Serviços de TI"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="number">Número do Contrato</Label>
                    <Input
                      id="number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Ex: CTR-2025-001"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contractType">Tipo de Contrato</Label>
                    <Select value={contractType} onValueChange={setContractType}>
                      <SelectTrigger id="contractType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(contractTypeLabels).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="object">Objeto do Contrato</Label>
                    <Textarea
                      id="object"
                      value={object}
                      onChange={(e) => setObject(e.target.value)}
                      placeholder="Descreva o objeto principal do contrato..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <hr/>

              {/* Parties */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</span>
                  Partes Contratantes
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <div className="rounded-lg bg-muted/40 p-3 border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">CONTRATADA (Fornecedor)</p>
                      <p className="text-sm font-semibold">{supplierName}</p>
                      <p className="text-xs text-muted-foreground">CNPJ: {supplierCnpj}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contractorName">Contratante (Empresa)</Label>
                    <Input
                      id="contractorName"
                      value={companyName} readOnly
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contractorCnpj">CNPJ do Contratante — conferir no instrumento</Label>
                    <Input
                      id="contractorCnpj"
                      value="" readOnly
                      placeholder="Conferir no instrumento individual"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="contractorRep">Representante Legal</Label>
                    <Input
                      id="contractorRep"
                      value={contractorRepresentative}
                      onChange={(e) => setContractorRepresentative(e.target.value)}
                      placeholder="Representante com poderes documentados"
                    />
                  </div>
                </div>
              </div>

              <hr/>

              {/* Financial & Dates */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">3</span>
                  Valores e Vigência
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="totalValue">Valor Total na moeda do contrato</Label>
                    <Input
                      id="totalValue"
                      value={totalValue}
                      onChange={(e) => setTotalValue(e.target.value)}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="endDate">Data de Término</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
                    <Textarea
                      id="paymentTerms"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Ex: Pagamento em 30 dias após emissão da nota fiscal..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <hr/>

<label>Moeda do contrato de prestador<input name="currency" defaultValue={initial?.currency??''} maxLength={3} required/></label><label>Texto individualizado do instrumento{lockedInstrumentText!==undefined?<textarea aria-label="Texto individualizado do instrumento" name="instrumentText" value={lockedInstrumentText} readOnly maxLength={legalTextLimit} required rows={8}/>:<textarea aria-label="Texto individualizado do instrumento" name="instrumentText" defaultValue={initial?.instrumentText??''} maxLength={legalTextLimit} required rows={8}/>}</label><p>Registrar o instrumento efetivamente individualizado. O cadastro não assina digitalmente nem substitui a conferência fiscal das partes. A contratante vem da empresa canônica.</p><label>Justificativa do contrato de prestador<textarea aria-label="Justificativa do contrato de prestador" name="reason" required/></label><button disabled={busy}>Salvar contrato de prestador</button></form>;}

