import {useState} from 'react';
import {Button} from '../../sge/components/ui/button.tsx';
import {Input} from '../../sge/components/ui/input.tsx';
import {Label} from '../../sge/components/ui/label.tsx';
import {Textarea} from '../../sge/components/ui/textarea.tsx';
import {Select,SelectTrigger,SelectContent,SelectValue,SelectItem} from '../../sge/components/ui/select.tsx';
export function AmendmentFields({initial,onSave,busy}:{initial:Record<string,any>;onSave:(data:Record<string,unknown>)=>void;busy:boolean}){const [amendmentForm,setAmendmentForm]=useState(initial);return <form onSubmit={e=>{e.preventDefault();onSave(amendmentForm);}}>
                    {/* Título */}
                    <div className="space-y-2">
                      <Label htmlFor="amend-title">Título *</Label>
                      <Input
                        id="amend-title"
                        placeholder="Ex: Segundo Termo Aditivo"
                        value={amendmentForm.title}
                        onChange={(e) => setAmendmentForm({ ...amendmentForm, title: e.target.value })}
                        required
                      />
                    </div>
                    {/* Descrição */}
                    <div className="space-y-2">
                      <Label htmlFor="amend-description">Descrição</Label>
                      <Textarea
                        id="amend-description"
                        placeholder="Descreva o objeto do aditivo..."
                        rows={3}
                        value={amendmentForm.description}
                        onChange={(e) => setAmendmentForm({ ...amendmentForm, description: e.target.value })}
                      />
                    </div>
                    {/* Tipo + Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amend-tipo">Tipo *</Label>
                        <Select value={amendmentForm.tipo} onValueChange={(v: any) => setAmendmentForm({ ...amendmentForm, tipo: v })}>
                          <SelectTrigger id="amend-tipo"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                            <SelectItem value="escopo">Escopo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amend-status">Status</Label>
                        <Select value={amendmentForm.status} onValueChange={(v: any) => setAmendmentForm({ ...amendmentForm, status: v })}>
                          <SelectTrigger id="amend-status"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Valor Adicional */}
                    <div className="space-y-2">
                      <Label htmlFor="amend-additionalValue">Valor Adicional *</Label>
                      <Input
                        id="amend-additionalValue"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amendmentForm.additionalValue}
                        onChange={(e) => setAmendmentForm({ ...amendmentForm, additionalValue: e.target.value })}
                        required
                      />
                    </div>
                    {/* Datas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amend-effectiveDate">Data de Vigência *</Label>
                        <Input
                          id="amend-effectiveDate"
                          type="date"
                          value={amendmentForm.effectiveDate}
                          onChange={(e) => setAmendmentForm({ ...amendmentForm, effectiveDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amend-endDate">Data de Término</Label>
                        <Input
                          id="amend-endDate"
                          type="date"
                          value={amendmentForm.endDate}
                          onChange={(e) => setAmendmentForm({ ...amendmentForm, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    {/* Observações */}
                    <div className="space-y-2">
                      <Label htmlFor="amend-observations">Observações</Label>
                      <Textarea
                        id="amend-observations"
                        placeholder="Observações adicionais..."
                        rows={2}
                        value={amendmentForm.observations}
                        onChange={(e) => setAmendmentForm({ ...amendmentForm, observations: e.target.value })}
                      />
                    </div>
<Button disabled={busy}>Salvar aditivo</Button></form>;}
