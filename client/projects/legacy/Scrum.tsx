// Adapted substantially from arqueo-gestao client/src/pages/Scrum.tsx; provenance in docs/IMPLEMENTACAO_08A_PROJETOS_SCRUM.md.
import {useEffect,useState,type ReactNode} from 'react';
import type {Project,ProjectRecord} from '../../../shared/projects/model.ts';
import type {sprintBurndown} from '../../../shared/projects/scrum.ts';
import { Button } from "../../sge/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../sge/components/ui/card.tsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../sge/components/ui/dialog.tsx";
import { Input } from "../../sge/components/ui/input.tsx";
import { Label } from "../../sge/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../sge/components/ui/select.tsx";
import { Textarea } from "../../sge/components/ui/textarea.tsx";
import { Badge } from "../../sge/components/ui/badge.tsx";
import { ArrowLeft, Plus, Play, CheckCircle, Target, Clock, Layers, ChevronRight, Calendar, Zap, ArrowRight, LayoutList, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";


function DashboardLayout({children}:{children:ReactNode}){return <div className="space-y-4">{children}</div>;}
function ScrollArea({children,className}:{children:ReactNode;className?:string}){return <div className={'overflow-auto '+className}>{children}</div>;}
function Progress({value,className}:{value:number;className?:string}){return <progress aria-label="Progresso por quantidade de tarefas" value={value} max={100} className={className}/>;}
export default function Scrum({data,busy,run,api,back}:{
 data:{project:Project;records:ProjectRecord[];capabilities:{edit:boolean;approve:boolean;export:boolean;reopen:boolean}};busy:boolean;
 run:(path:string,method:string,body:Record<string,unknown>)=>Promise<unknown>;
 api:<T>(path:string)=>Promise<T>;back:()=>void;
}) {
 const projectId=data.project.id,project=data.project.payload,setLocation=(_path?:string)=>back();
 const sprints=data.records.filter(r=>r.kind==='sprint').map(r=>({id:r.id,name:String(r.payload.title),goal:String(r.payload.goal??''),startDate:String(r.payload.startDate),endDate:String(r.payload.endDate),status:r.payload.status==='planned'?'planning':String(r.payload.status)}));
 const tasks=data.records.filter(r=>r.kind==='task').map(r=>({id:r.id,title:String(r.payload.title),description:String(r.payload.description??''),priority:String(r.payload.priority),sprintId:r.payload.sprintId as string|null,status:!r.payload.sprintId&&r.payload.status==='todo'?'backlog':String(r.payload.status),storyPoints:Number(r.payload.storyPoints)}));
 const [isSprintDialogOpen,setIsSprintDialogOpen]=useState(false),[isTaskDialogOpen,setIsTaskDialogOpen]=useState(false);
 const sprintBlank={name:'',goal:'',startDate:'',endDate:''},taskBlank={title:'',description:'',priority:'medium',storyPoints:'',startDate:'',endDate:''};
 const [newSprint,setNewSprint]=useState(sprintBlank),[newTask,setNewTask]=useState(taskBlank),[error,setError]=useState('');
 const [decision,setDecision]=useState<{id:string;action:'start'|'complete'|'reopen'}|null>(null),[reason,setReason]=useState(''),[acceptIncomplete,setAcceptIncomplete]=useState(false);
 const [chartSprint,setChartSprint]=useState(''),[burndownData,setBurndownData]=useState<ReturnType<typeof sprintBurndown>|null>(null),[chartError,setChartError]=useState('');
 const active=sprints.find(s=>s.status==='active'),chartId=chartSprint||active?.id||'';
 useEffect(()=>{let live=true;setBurndownData(null);setChartError('');if(chartId)void api<ReturnType<typeof sprintBurndown>>('/'+projectId+'/scrum/'+chartId).then(v=>{if(live)setBurndownData(v);}).catch(e=>{if(live)setChartError(e.message);});return()=>{live=false;};},[projectId,data.project.revision,chartId]);
 useEffect(()=>{const leave=(e:Event)=>{if(isSprintDialogOpen||isTaskDialogOpen||decision)e.preventDefault();},unload=(e:BeforeUnloadEvent)=>{if(isSprintDialogOpen||isTaskDialogOpen||decision){e.preventDefault();e.returnValue='';}};window.addEventListener('strategy:leave',leave);window.addEventListener('beforeunload',unload);return()=>{window.removeEventListener('strategy:leave',leave);window.removeEventListener('beforeunload',unload);};},[isSprintDialogOpen,isTaskDialogOpen,decision]);
 async function perform(path:string,body:Record<string,unknown>,success?:()=>void){setError('');try{await run('/'+projectId+path,'POST',body);success?.();}catch(e){setError((e as Error).message);}}
 const save=(kind:'sprint'|'task',payload:Record<string,unknown>,old?:ProjectRecord,success?:()=>void)=>perform('/records/'+kind,{revision:data.project.revision,data:payload,...(old?{id:old.id,recordRevision:old.revision}:{})},success);
 const createSprintMutation={isPending:busy},createTaskMutation={isPending:busy};
 const decide=(id:string,action:'start'|'complete'|'reopen')=>{setReason('');setAcceptIncomplete(false);setDecision({id,action});};
 const startSprintMutation={isPending:busy,mutate:({id}:{id:string})=>decide(id,'start')};
 const completeSprintMutation={isPending:busy,mutate:({id}:{id:string})=>decide(id,'complete')};
 const handleCreateSprint=(e:React.FormEvent)=>{e.preventDefault();void save('sprint',{title:newSprint.name,goal:newSprint.goal,startDate:newSprint.startDate,endDate:newSprint.endDate,status:'planned'},undefined,()=>{setIsSprintDialogOpen(false);setNewSprint(sprintBlank);});};
 const handleCreateTask=(e:React.FormEvent)=>{e.preventDefault();void save('task',{title:newTask.title,description:newTask.description,priority:newTask.priority,storyPoints:Number(newTask.storyPoints||0),startDate:newTask.startDate,endDate:newTask.endDate,progress:0,status:'todo',estimatedHours:0},undefined,()=>{setIsTaskDialogOpen(false);setNewTask(taskBlank);});};
 const handleMoveToSprint=(id:string,sprintId:string|null)=>{const old=data.records.find(r=>r.id===id)!;void save('task',{...old.payload,sprintId},old);};
 const updateStatus=(id:string,status:string)=>{const old=data.records.find(r=>r.id===id)!;void save('task',{...old.payload,status,progress:status==='done'?100:Number(old.payload.progress)},old);};
 async function exportHistory(){setError('');try{const v=await api('/'+projectId+'/scrum/'+chartId+'?export=json'),url=URL.createObjectURL(new Blob([JSON.stringify(v,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='sprint-historico.json';a.click();URL.revokeObjectURL(url);}catch(e){setError((e as Error).message);}}
  // Group tasks
  const backlogTasks = tasks?.filter(t => !t.sprintId && t.status === 'backlog') || [];
  const getSprintTasks = (sprintId: string) => tasks?.filter(t => t.sprintId === sprintId) || [];

  const getSprintProgress = (sprintId: string) => {
    const sprintTasks = getSprintTasks(sprintId);
    if (sprintTasks.length === 0) return 0;
    const doneTasks = sprintTasks.filter(t => t.status === 'done').length;
    return Math.round((doneTasks / sprintTasks.length) * 100);
  };

  const getSprintPoints = (sprintId: string) => {
    const sprintTasks = getSprintTasks(sprintId);
    const total = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const done = sprintTasks.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    return { total, done };
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { label: string; className: string }> = {
      low: { label: "Baixa", className: "bg-slate-100 text-slate-700" },
      medium: { label: "Média", className: "bg-amber-100 text-amber-800" },
      high: { label: "Alta", className: "bg-orange-100 text-orange-800" },
      urgent: { label: "Urgente", className: "bg-red-100 text-red-800" },
    };
    const c = config[priority] || config.medium;
    return <Badge variant="secondary" className={`text-xs ${c.className}`}>{c.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      backlog: { label: "Backlog", className: "bg-gray-100 text-gray-700" },
      todo: { label: "A Fazer", className: "bg-blue-100 text-blue-800" },
      in_progress: { label: "Em Progresso", className: "bg-amber-100 text-amber-800" },
      review: { label: "Em Revisão", className: "bg-purple-100 text-purple-800" },
      done: { label: "Concluído", className: "bg-emerald-100 text-emerald-800" },
      blocked: { label: "Bloqueado", className: "bg-red-100 text-red-800" },
    };
    const c = config[status] || config.backlog;
    return <Badge variant="secondary" className={`text-xs ${c.className}`}>{c.label}</Badge>;
  };

  const getSprintStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      planning: { label: "Planejamento", className: "bg-gray-100 text-gray-700" },
      active: { label: "Ativa", className: "bg-emerald-100 text-emerald-800" },
      completed: { label: "Concluída", className: "bg-blue-100 text-blue-800" },
    };
    const c = config[status] || config.planning;
    return <Badge variant="secondary" className={`${c.className}`}>{c.label}</Badge>;
  };

  // Get active sprint
  const activeSprint = sprints?.find(s => s.status === 'active');
  const planningSprints = sprints?.filter(s => s.status === 'planning') || [];
  const completedSprints = sprints?.filter(s => s.status === 'completed') || [];
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <p>Pontos são estimativas de planejamento; não geram custo, despesa ou progresso físico automático.</p>
        {error&&<p role="alert">{error}</p>}{chartError&&<p role="alert">{chartError}</p>}
        <Dialog open={!!decision} onOpenChange={open=>{if(!open&&!busy)setDecision(null);}}><DialogContent><form onSubmit={e=>{e.preventDefault();if(!decision)return;const old=data.records.find(r=>r.id===decision.id)!;void perform('/scrum/'+old.id+'/'+decision.action,{revision:data.project.revision,recordRevision:old.revision,reason,acceptIncomplete},()=>setDecision(null));}}><DialogHeader><DialogTitle>Decisão sobre sprint</DialogTitle><DialogDescription>Datas planejadas e histórico serão preservados. Reabertura exige diretor; encerramento exige aprovação.</DialogDescription></DialogHeader><Label htmlFor="scrumReason">Justificativa da decisão Scrum</Label><Textarea id="scrumReason" required value={reason} onChange={e=>setReason(e.target.value)}/>{decision?.action==='complete'&&<label><input type="checkbox" checked={acceptIncomplete} onChange={e=>setAcceptIncomplete(e.target.checked)}/>Aceitar encerramento com tarefas pendentes, sem marcá-las como concluídas</label>}<Button type="submit" disabled={busy}>Confirmar decisão Scrum</Button><Button type="button" variant="outline" disabled={busy} onClick={()=>setDecision(null)}>Cancelar decisão</Button></form></DialogContent></Dialog>
        <label>Histórico da sprint<select aria-label="Histórico da sprint" value={chartId} onChange={e=>setChartSprint(e.target.value)}><option value="">Selecione</option>{sprints.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        {chartId&&data.capabilities.export&&<Button onClick={()=>void exportHistory()}>Exportar histórico Scrum</Button>}
        {burndownData&&<details><summary>Observações persistidas do burndown</summary><p>{burndownData.limitation} Base: {burndownData.baselinePoints??'desconhecida'}; alteração de escopo: {burndownData.scopeChange??'desconhecida'} pontos.</p><table aria-label="Observações Scrum"><thead><tr><th>Registro UTC</th><th>Revisão</th><th>Motivo</th><th>Total</th><th>Restantes</th></tr></thead><tbody>{burndownData.observations.map(o=><tr key={o.id}><td>{o.recordedAt}</td><td>{o.projectRevision}</td><td>{o.reason}</td><td>{o.totalPoints}</td><td>{o.remainingPoints}</td></tr>)}</tbody></table></details>}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setLocation(`/projects/${projectId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{project.name} - Scrum</h1>
              <p className="text-muted-foreground text-sm">Gerencie sprints e backlog do projeto</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSprintDialogOpen} onOpenChange={setIsSprintDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!data.capabilities.edit || busy}>
                  <Layers className="mr-2 h-4 w-4" />
                  Nova Sprint
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateSprint}>
                  <DialogHeader>
                    <DialogTitle>Nova Sprint</DialogTitle>
                    <DialogDescription>Crie uma nova sprint para o projeto</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sprintName">Nome da Sprint *</Label>
                      <Input
                        id="sprintName"
                        value={newSprint.name}
                        onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                        placeholder="Ex: Sprint 1"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sprintGoal">Objetivo</Label>
                      <Textarea
                        id="sprintGoal"
                        value={newSprint.goal}
                        onChange={(e) => setNewSprint({ ...newSprint, goal: e.target.value })}
                        placeholder="O que queremos alcançar nesta sprint?"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="sprintStart">Data de Início</Label>
                        <Input
                          required id="sprintStart"
                          type="date"
                          value={newSprint.startDate}
                          onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sprintEnd">Data de Término</Label>
                        <Input
                          required id="sprintEnd"
                          type="date"
                          value={newSprint.endDate}
                          onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsSprintDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={!data.capabilities.edit || createSprintMutation.isPending}>
                      {createSprintMutation.isPending ? "Criando..." : "Criar Sprint"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!data.capabilities.edit || busy} className="gradient-arqueo-primary text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateTask}>
                  <DialogHeader>
                    <DialogTitle>Nova Tarefa no Backlog</DialogTitle>
                    <DialogDescription>Adicione uma nova tarefa ao backlog do projeto</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="taskTitle">Título *</Label>
                      <Input
                        id="taskTitle"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Título da tarefa"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="taskStart">Início da tarefa</Label><Input id="taskStart" type="date" required value={newTask.startDate} onChange={e=>setNewTask({...newTask,startDate:e.target.value})}/>
                      <Label htmlFor="taskEnd">Fim da tarefa</Label><Input id="taskEnd" type="date" required value={newTask.endDate} onChange={e=>setNewTask({...newTask,endDate:e.target.value})}/>
                      <Label htmlFor="taskDesc">Descrição</Label>
                      <Textarea
                        id="taskDesc"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Descrição da tarefa"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="taskPriority">Prioridade</Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                        >
                          <SelectTrigger id="taskPriority">
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
                      <div className="grid gap-2">
                        <Label htmlFor="taskPoints">Story Points</Label>
                        <Input
                          id="taskPoints"
                          type="number"
                          min="0"
                          value={newTask.storyPoints}
                          onChange={(e) => setNewTask({ ...newTask, storyPoints: e.target.value })}
                          placeholder="Ex: 3"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={!data.capabilities.edit || createTaskMutation.isPending}>
                      {createTaskMutation.isPending ? "Criando..." : "Criar Tarefa"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Backlog */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutList className="h-5 w-5" />
                Backlog
                <Badge variant="secondary" className="ml-auto">{backlogTasks.length}</Badge>
              </CardTitle>
              <CardDescription>Tarefas aguardando para serem planejadas</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {backlogTasks.map(task => (
                    <Card key={task.id} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {getPriorityBadge(task.priority)}
                            {task.storyPoints !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                {task.storyPoints} pts
                              </Badge>
                            )}
                          </div>
                        </div>
                        {planningSprints.length > 0 && (
                          <Select onValueChange={(value) => handleMoveToSprint(task.id, value)}>
                            <SelectTrigger disabled={!data.capabilities.edit || busy} aria-label={`Sprint da tarefa ${task.title}`} className="w-8 h-8 p-0">
                              <ArrowRight className="h-4 w-4" />
                            </SelectTrigger>
                            <SelectContent>
                              {planningSprints.map(sprint => (
                                <SelectItem key={sprint.id} value={sprint.id.toString()}>
                                  {sprint.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </Card>
                  ))}
                  {backlogTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <LayoutList className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Backlog vazio
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Sprints */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Sprint */}
            {activeSprint && (
              <Card className="border-emerald-300 border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-emerald-600" />
                        {activeSprint.name}
                        {getSprintStatusBadge(activeSprint.status)}
                      </CardTitle>
                      {activeSprint.goal && (
                        <CardDescription className="mt-1">{activeSprint.goal}</CardDescription>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => completeSprintMutation.mutate({ id: activeSprint.id })}
                      disabled={!data.capabilities.approve || completeSprintMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Concluir Sprint
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Sprint Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progresso</span>
                      <span>{getSprintProgress(activeSprint.id)}%</span>
                    </div>
                    <Progress value={getSprintProgress(activeSprint.id)} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(activeSprint.startDate)} - {formatDate(activeSprint.endDate)}
                      </span>
                      <span>
                        {getSprintPoints(activeSprint.id).done}/{getSprintPoints(activeSprint.id).total} pontos
                      </span>
                    </div>
                  </div>
                  
                  {/* Burndown Chart */}
                  {chartId===activeSprint.id && burndownData && burndownData.totalPoints !== null && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-sm">Gráfico Burndown</span>
                      </div>
                      <div className="h-48 bg-gray-50 rounded-xl p-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={burndownData.idealLine.map((ideal, i) => ({
                              day: ideal.date,
                              ideal: ideal.points,
                              actual: burndownData.actualLine[i]?.points ?? null
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="day" 
                              tick={{ fontSize: 10 }} 
                              stroke="#9CA3AF"
                            />
                            <YAxis 
                              tick={{ fontSize: 10 }} 
                              stroke="#9CA3AF"
                              domain={[0, 'dataMax']}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                borderRadius: '8px', 
                                border: 'none', 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: '12px'
                              }} 
                            />
                            <Legend 
                              wrapperStyle={{ fontSize: '11px' }}
                            />
                            <Line 
                              type="linear" 
                              dataKey="ideal" 
                              stroke="#9CA3AF" 
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={false}
                              name="Ideal de planejamento"
                            />
                            <Line 
                              type="linear" 
                              dataKey="actual" 
                              stroke="#F7941D" 
                              strokeWidth={2}
                              dot={{ fill: '#F7941D', r: 3 }}
                              name="Real observado"
                              connectNulls={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Dia {burndownData.daysElapsed} de {burndownData.daysTotal}</span>
                        <span>{burndownData.remainingPoints} pontos restantes</span>
                      </div>
                    </div>
                  )}

                  {/* Sprint Tasks */}
                  <div className="space-y-2">
                    {getSprintTasks(activeSprint.id).map(task => (
                      <Card key={task.id} className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(task.status)}<select disabled={!data.capabilities.edit||busy} aria-label={`Estado Scrum ${task.title}`} value={task.status} onChange={e=>updateStatus(task.id,e.target.value)}><option value="todo">A fazer</option><option value="in_progress">Em progresso</option><option value="review">Em revisão</option><option value="done">Concluído</option></select>
                              {getPriorityBadge(task.priority)}
                              {task.storyPoints !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  {task.storyPoints} pts
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!data.capabilities.edit||busy} aria-label={`Retirar ${task.title} da sprint`} onClick={() => handleMoveToSprint(task.id, null)}
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {getSprintTasks(activeSprint.id).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Nenhuma tarefa na sprint
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Planning Sprints */}
            {planningSprints.map(sprint => (
              <Card key={sprint.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {sprint.name}
                        {getSprintStatusBadge(sprint.status)}
                      </CardTitle>
                      {sprint.goal && (
                        <CardDescription className="mt-1">{sprint.goal}</CardDescription>
                      )}
                    </div>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => startSprintMutation.mutate({ id: sprint.id })}
                      disabled={!data.capabilities.edit || startSprintMutation.isPending || !!activeSprint}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Iniciar Sprint
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-3">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                    <span className="ml-4">
                      {getSprintTasks(sprint.id).length} tarefas • {getSprintPoints(sprint.id).total} pontos
                    </span>
                  </div>
                  <div className="space-y-2">
                    {getSprintTasks(sprint.id).map(task => (
                      <Card key={task.id} className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getPriorityBadge(task.priority)}
                              {task.storyPoints !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                  {task.storyPoints} pts
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!data.capabilities.edit||busy} aria-label={`Retirar ${task.title} da sprint`} onClick={() => handleMoveToSprint(task.id, null)}
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {getSprintTasks(sprint.id).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Selecione esta sprint no menu da tarefa no backlog
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {!activeSprint && planningSprints.length === 0 && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">Nenhuma sprint criada</p>
                    <p className="text-sm">Crie uma sprint para começar a planejar o trabalho</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed Sprints (collapsed) */}
            {completedSprints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    Sprints Concluídas
                    <Badge variant="secondary" className="ml-auto">{completedSprints.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {completedSprints.map(sprint => (
                      <div key={sprint.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                        <span>{sprint.name}</span><Button disabled={!data.capabilities.reopen||busy} variant="outline" onClick={()=>decide(sprint.id,'reopen')}>Solicitar reabertura {sprint.name}</Button>
                        <span className="text-muted-foreground">
                          {getSprintPoints(sprint.id).done} pontos
                        </span>
                      </div>
                    ))}

                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
