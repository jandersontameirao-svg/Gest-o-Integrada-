import {useState} from 'react';
import {Button} from '../../sge/components/ui/button.tsx';
import {Input} from '../../sge/components/ui/input.tsx';
import {Label} from '../../sge/components/ui/label.tsx';
import {Textarea} from '../../sge/components/ui/textarea.tsx';
import {Select,SelectTrigger,SelectContent,SelectValue,SelectItem} from '../../sge/components/ui/select.tsx';
export function MilestoneFields({initial,onSave,busy}:{initial:Record<string,any>;onSave:(data:Record<string,unknown>)=>void;busy:boolean}){const [formData,setFormData]=useState(initial);return <form onSubmit={e=>{e.preventDefault();onSave(formData);}}>
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição *</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Ex: Parcela 1/3"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valorPrevisto">Valor *</Label>
                      <Input
                        id="valorPrevisto"
                        type="number"
                        step="0.01"
                        value={formData.valorPrevisto}
                        onChange={(e) => setFormData({ ...formData, valorPrevisto: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Data de Vencimento *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prazoPagamento">Prazo de Pagamento (dias após vencimento)</Label>
                      <Input
                        id="prazoPagamento"
                        type="number"
                        value={formData.prazoPagamento}
                        onChange={(e) => setFormData({ ...formData, prazoPagamento: Number(e.target.value) })}
                        placeholder="Ex: 30"
                      />
                    </div>
<label>Condição contratual<Textarea aria-label="Condição contratual" value={formData.conditionText} onChange={e=>setFormData({...formData,conditionText:e.target.value})}/></label><label>Estado do marco<select aria-label="Estado do marco" value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})}>{['pending','completed','cancelled'].map(s=><option key={s}>{s}</option>)}</select></label><Button disabled={busy}>Salvar marco</Button><p>Conclusão contratual não representa pagamento ou recebimento.</p></form>;}
