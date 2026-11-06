// JSX original: arqueo-gestao client/src/pages/Projects.tsx, campos de cadastro.
import {useState} from 'react';
import {Input} from '../../sge/components/ui/input.tsx';
import {Label} from '../../sge/components/ui/label.tsx';
import {Textarea} from '../../sge/components/ui/textarea.tsx';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '../../sge/components/ui/select.tsx';
import type {ProjectPayload} from '../../../shared/projects/model.ts';
export function ProjectFields({initial,users,busy,onSave}:{initial:ProjectPayload;users:{id:string;name:string}[];busy:boolean;onSave:(p:ProjectPayload)=>void}){const [formData,setFormData]=useState(initial);return <form onSubmit={e=>{e.preventDefault();onSave(formData);}}><div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Nome do Projeto *</Label>
                      <Input
                        id="project-name" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Desenvolvimento do App Mobile"
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="project-code">Código Interno</Label>
                        <Input
                          id="project-code" value={formData.internalCode}
                          onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                          placeholder="Ex: PRJ-2026-001"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gestor do Projeto</Label>
                        <Select
                          value={formData.managerId || "none"}
                          onValueChange={(value) => setFormData({ ...formData, managerId: value === "none" ? "" : value })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Selecione o gestor..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem gestor definido</SelectItem>
                            {users?.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-description">Descrição</Label>
                      <Textarea
                        id="project-description" value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descreva o projeto..."
                        className="rounded-xl resize-none"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={formData.status || undefined}
                          onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planning">📋 Planejamento</SelectItem>
                            <SelectItem value="in_progress">🚀 Em Andamento</SelectItem>
                            <SelectItem value="on_hold">⏸️ Pausado</SelectItem>
                            <SelectItem value="completed">✅ Concluído</SelectItem>
                            <SelectItem value="cancelled">❌ Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Metodologia</Label>
                        <Select
                          value={formData.methodology || undefined}
                          onValueChange={(value) => setFormData({ ...formData, methodology: value })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kanban">Kanban</SelectItem>
                            <SelectItem value="scrum">Scrum</SelectItem>
                            <SelectItem value="waterfall">Cascata</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Prioridade</Label>
                        <Select
                          value={formData.priority || undefined}
                          onValueChange={(value) => setFormData({ ...formData, priority: value })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="urgent">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

</div><button disabled={busy}>Salvar projeto</button></form>;}
