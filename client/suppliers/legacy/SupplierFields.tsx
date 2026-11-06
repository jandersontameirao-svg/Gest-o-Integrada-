import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '../../sge/components/ui/select.tsx';
// JSX adaptado de arqueo-fornecedores 8b5c9409, SupplierForm.tsx: informações básicas/endereço.
import {useState} from 'react';
import {Card,CardContent,CardHeader,CardTitle,CardDescription} from '../../sge/components/ui/card.tsx';
import {Input} from '../../sge/components/ui/input.tsx';
import {Label} from '../../sge/components/ui/label.tsx';
import {Building2,MapPin} from 'lucide-react';
import type {SupplierDetails} from '../../../shared/suppliers/model.ts';
export const blankSupplier={companyName:'',cnpj:'',tradeName:'',stateRegistration:'',municipalRegistration:'',email:'',phone:'',website:'',street:'',number:'',complement:'',neighborhood:'',city:'',state:'',zipCode:'',country:'',notes:''};
export type SupplierFormData=SupplierDetails&{companyName:string;cnpj:string};
export function SupplierFields({initial,editing,busy,onSave}:{initial:SupplierFormData;editing:boolean;busy:boolean;onSave:(v:SupplierFormData,reason:string)=>void}){const [formData,setFormData]=useState(initial);const handleChange=(key:string,value:string)=>setFormData(prev=>({...prev,[key]:key==='cnpj'?value.replace(/\D/g,''):key==='state'?value.toUpperCase():value}));return <form onSubmit={e=>{e.preventDefault();onSave(formData,String(new FormData(e.currentTarget).get('reason')??''));}} className="space-y-6">
{/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Informações Básicas
            </CardTitle>
            <CardDescription>Dados principais do fornecedor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplier-companyName">Nome / Razão Social *</Label>
                <Input
                  id="supplier-companyName" disabled={editing} value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Nome ou razão social" required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-tradeName">Nome Fantasia</Label>
                <Input
                  id="supplier-tradeName" value={formData.tradeName}
                  onChange={(e) => handleChange("tradeName", e.target.value)}
                  placeholder="Nome comercial"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="supplier-cnpj">CPF/CNPJ *</Label>
                <Input
                  id="supplier-cnpj" disabled={editing} value={formData.cnpj}
                  onChange={(e) => handleChange("cnpj", e.target.value)}
                  placeholder="11 ou 14 dígitos" required pattern="[0-9]{11}|[0-9]{14}"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-stateRegistration">Inscrição Estadual</Label>
                <Input
                  id="supplier-stateRegistration" value={formData.stateRegistration}
                  onChange={(e) => handleChange("stateRegistration", e.target.value)}
                  placeholder="Inscrição estadual"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-municipalRegistration">Inscrição Municipal</Label>
                <Input
                  id="supplier-municipalRegistration" value={formData.municipalRegistration}
                  onChange={(e) => handleChange("municipalRegistration", e.target.value)}
                  placeholder="Inscrição municipal"
                />
              </div>
            </div>
            <hr className="border-border"/>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="supplier-email">E-mail do fornecedor</Label>
                <Input
                  type="email"
                  id="supplier-email" value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="email@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-phone">Telefone do fornecedor</Label>
                <Input
                  id="supplier-phone" value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-website">Website</Label>
                <Input
                  id="supplier-website" value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://www.empresa.com"
                />
              </div>
            </div>
            <hr className="border-border"/>
          </CardContent>
        </Card>
{/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </CardTitle>
            <CardDescription>Localização do fornecedor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="supplier-street">Logradouro</Label>
                <Input
                  id="supplier-street" value={formData.street}
                  onChange={(e) => handleChange("street", e.target.value)}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-number">Número</Label>
                <Input
                  id="supplier-number" value={formData.number}
                  onChange={(e) => handleChange("number", e.target.value)}
                  placeholder="Nº"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-complement">Complemento</Label>
                <Input
                  id="supplier-complement" value={formData.complement}
                  onChange={(e) => handleChange("complement", e.target.value)}
                  placeholder="Sala, Andar, etc."
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="supplier-neighborhood">Bairro</Label>
                <Input
                  id="supplier-neighborhood" value={formData.neighborhood}
                  onChange={(e) => handleChange("neighborhood", e.target.value)}
                  placeholder="Bairro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-city">Cidade</Label>
                <Input
                  id="supplier-city" value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-state">Estado</Label>
                <Select
                  value={formData.state || "_none"}
                  onValueChange={(value) => handleChange("state", value === "_none" ? "" : value)}
                >
                  <SelectTrigger id="supplier-state" aria-label="Estado">
                    <SelectValue placeholder="Selecionar UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Selecionar</SelectItem>
                    {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier-zipCode">CEP</Label>
                <Input
                  id="supplier-zipCode" value={formData.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <label>Notas cadastrais<textarea value={formData.notes} onChange={e=>handleChange('notes',e.target.value)} maxLength={3000}/></label><label>Justificativa do cadastro ou alteração<input name="reason" required/></label><button disabled={busy}>Salvar cadastro em rascunho</button></form>;}
