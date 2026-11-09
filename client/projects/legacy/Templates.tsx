// Substantially reused from authorized arqueo-gestao Templates.tsx.
import type {ReactNode} from "react";
import type {SavedTemplate} from "../../../shared/projects/templates.ts";
function DashboardLayout({children}:{children:ReactNode}){return <div>{children}</div>;}
import { Button } from "../../sge/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../sge/components/ui/card.tsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../sge/components/ui/dialog.tsx";
import { Input } from "../../sge/components/ui/input.tsx";
import { Label } from "../../sge/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../sge/components/ui/select.tsx";
import { Badge } from "../../sge/components/ui/badge.tsx";
import { 
  FileCode, 
  Megaphone, 
  Building2, 
  Briefcase, 
  LayoutTemplate,
  Plus,
  Eye,
  Layers,
  ListTodo,
  Sparkles,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

const categoryIcons: Record<string, React.ReactNode> = {
  software: <FileCode className="h-6 w-6" />,
  marketing: <Megaphone className="h-6 w-6" />,
  construction: <Building2 className="h-6 w-6" />,
  consulting: <Briefcase className="h-6 w-6" />,
  arqueologia: <Layers className="h-6 w-6" />,
  general: <LayoutTemplate className="h-6 w-6" />,
};

const categoryColors: Record<string, string> = {
  software: "from-blue-500 to-cyan-500",
  marketing: "from-pink-500 to-rose-500",
  construction: "from-amber-500 to-orange-500",
  consulting: "from-purple-500 to-violet-500",
  arqueologia: "from-emerald-500 to-teal-500",
  energia:"from-blue-500 to-orange-500",infraestrutura:"from-amber-500 to-slate-500",
  general: "from-gray-500 to-slate-500",
};

const categoryLabels: Record<string, string> = {
  software: "Software",
  marketing: "Marketing",
  construction: "Construção",
  consulting: "Consultoria",
  arqueologia:"Arqueologia",energia:"Energia",infraestrutura:"Infraestrutura",
  general: "Geral",
};

const methodologyLabels: Record<string, string> = {
  scrum: "Scrum",
  kanban: "Kanban",waterfall:"Cascata",
};

export default function Templates({items,canApply,canApprove,canEdit,busy,onSeed,onUse,onEdit,onDetail,onStatus}:{items:SavedTemplate[];canApply:boolean;canApprove:boolean;canEdit:boolean;busy:boolean;onSeed:()=>void;onUse:(t:SavedTemplate)=>void;onEdit:(t:SavedTemplate)=>void;onDetail:(t:SavedTemplate)=>void;onStatus:(t:SavedTemplate,action:'approve'|'archive'|'restore')=>void}) {
 const templates=items.map(t=>({...t,...t.data}));
 const [selectedTemplate,setSelectedTemplate]=useState<string|null>(null),[isPreviewOpen,setIsPreviewOpen]=useState(false);
 const selectedTemplateData=templates.find(t=>t.id===selectedTemplate),templatePhases=selectedTemplateData?.data.phases,templateTasks=selectedTemplateData?.data.tasks;
 const handlePreview=(id:string)=>{setSelectedTemplate(id);setIsPreviewOpen(true);};
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Templates de Projeto</h1>
            <p className="text-muted-foreground">
              Use templates para planejar fases e atividades no projeto autorizado, sem criar contratos ou custos
            </p>
          </div>
          {canApprove && (
            <Button 
              onClick={onSeed}
              disabled={busy}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Importar referências do código legado
            </Button>
          )}
        </div>

        {/* Templates Grid */}
        {templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <Card 
                key={template.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md"
              >
                {/* Colored Header */}
                <div className={`h-24 bg-gradient-to-br ${categoryColors[template.category]} p-4 flex items-end`}>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-white">
                    {categoryIcons[template.category]}
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p>Versão {template.version} · {template.status} · origem {String((template.provenance as {kind?:string})?.kind??'informada')}</p>
                  <p>{String((template.provenance as {notes?:string})?.notes??'')}</p>
                  <div className="flex gap-2 my-2"><Button variant="outline" onClick={()=>onDetail(template)}>Detalhes e histórico</Button><Button disabled={busy||!canEdit} variant="outline" onClick={()=>onEdit(template)}>Editar modelo</Button>{canApprove&&<><Button disabled={busy||template.status!=='draft'} onClick={()=>onStatus(template,'approve')}>Aprovar modelo</Button><Button disabled={busy} variant="outline" onClick={()=>onStatus(template,template.status==='archived'?'restore':'archive')}>{template.status==='archived'?'Restaurar modelo':'Arquivar modelo'}</Button></>}</div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {categoryLabels[template.category]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {methodologyLabels[template.methodology]}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePreview(template.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      disabled={!canApply||busy||template.status!=='approved'} onClick={() => {
                        setSelectedTemplate(template.id);
                        onUse(template);
                      }}
                    >
                      Usar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <LayoutTemplate className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Nenhum template disponível</p>
                {canApprove && (
                  <p className="text-sm">Clique em "Importar referências do código legado" para começar</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTemplateData && categoryIcons[selectedTemplateData.category]}
                {selectedTemplateData?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedTemplateData?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Template Info */}
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {selectedTemplateData && categoryLabels[selectedTemplateData.category]}
                </Badge>
                <Badge variant="outline">
                  {selectedTemplateData && methodologyLabels[selectedTemplateData.methodology]}
                </Badge>
              </div>
              
              {/* Phases */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-amber-500" />
                  Fases ({templatePhases?.length || 0})
                </h4>
                <div className="space-y-2">
                  {templatePhases?.map((phase, index) => (
                    <div 
                      key={phase.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: phase.color || '#3B82F6' }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{phase.name}</p>
                        {phase.description && (
                          <p className="text-xs text-muted-foreground">{phase.description}</p>
                        )}
                      </div>
                      {phase.durationDays && (
                        <Badge variant="outline" className="text-xs">
                          {phase.durationDays} dias
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Tasks */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-amber-500" />
                  Tarefas ({templateTasks?.length || 0})
                </h4>
                <div className="space-y-2">
                  {templateTasks?.map(task => {
                    const phase = templatePhases?.find(p => p.id === task.phaseId);
                    return (
                      <div 
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{task.title}</p>
                          {phase && (
                            <p className="text-xs text-muted-foreground">
                              Fase: {phase.name}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {task.storyPoints !== null && (
                            <Badge variant="outline" className="text-xs">
                              {task.storyPoints} pts
                            </Badge>
                          )}
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {task.priority === 'urgent' ? 'Urgente' :
                             task.priority === 'high' ? 'Alta' :
                             task.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Fechar
              </Button>
              <Button 
                disabled={!canApply||busy||selectedTemplateData?.status!=='approved'} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                onClick={() => {
                  setIsPreviewOpen(false);
                  if(selectedTemplateData)onUse(selectedTemplateData);
                }}
              >
                Usar Template
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
