// Substantially reused from original TemplateDetail.tsx.
import type {ReactNode} from "react";
import type {SavedTemplate} from "../../../shared/projects/templates.ts";
function DashboardLayout({children}:{children:ReactNode}){return <div>{children}</div>;}
import { Button } from "../../sge/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../sge/components/ui/card.tsx";
import { Badge } from "../../sge/components/ui/badge.tsx";
import { TemplateGantt } from "./TemplateGantt.tsx";
import { 
  ArrowLeft, 
  Layers, 
  ListTodo, 
  Clock,
  FileCode,
  Megaphone,
  Building2,
  Briefcase,
  LayoutTemplate
} from "lucide-react";

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
  energia:"from-blue-500 to-orange-500",infraestrutura:"from-amber-500 to-slate-500",general: "from-gray-500 to-slate-500",
};

const categoryLabels: Record<string, string> = {
  software: "Software",
  marketing: "Marketing",
  construction: "Construção",
  consulting: "Consultoria",
  arqueologia: "Arqueologia",
  energia:"Energia",infraestrutura:"Infraestrutura",general: "Geral",
};

const methodologyLabels: Record<string, string> = {
  agile: "Ágil",
  waterfall: "Cascata",
  hybrid: "Híbrido",scrum:"Scrum",kanban:"Kanban",
  lean: "Lean",
};

export default function TemplateDetail({item,onBack,onUse,canApply}:{item:SavedTemplate;onBack:()=>void;onUse:()=>void;canApply:boolean}) {
 const template={...item,...item.data},templateTasks=item.data.tasks,phases=item.data.phases;
 const tasksLoading=false,navigate=(_path:string)=>onBack();
 const ganttTasks=templateTasks.filter(t=>t.durationDays!==null&&t.startDay!==null).map(t=>({id:t.id,name:t.title,phaseId:t.phaseId??'ungrouped',phaseName:phases.find(p=>p.id===t.phaseId)?.name??'Sem fase',startDay:t.startDay!,duration:t.durationDays!,order:t.order,color:phases.find(p=>p.id===t.phaseId)?.color}));
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/templates")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{template.name}</h1>
              <p className="text-gray-600 mt-1">{template.description}</p>
            </div>
          </div>
        </div>

        {/* Template Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`bg-gradient-to-br ${categoryColors[template.category]} p-3 rounded-lg text-white`}>
                  {categoryIcons[template.category]}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Categoria</div>
                  <div className="font-semibold">{categoryLabels[template.category]}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Fases</div>
                  <div className="font-semibold">{phases.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg text-green-600">
                  <ListTodo className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tarefas</div>
                  <div className="font-semibold">{templateTasks?.length || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Duração Est.</div>
                  <div className="font-semibold">
                    {templateTasks.some(t=>t.durationDays===null)?'Há atividades sem duração informada':Math.max(0,...ganttTasks.map(t=>t.startDay+t.duration))+' dias relativos'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gantt Chart */}
        <TemplateGantt 
          tasks={ganttTasks} 
          title="Estimativas explícitas do modelo — sem conversão presumida de horas"
          compact={false}
        />

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Tarefas do Template</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-2">
                <p>Carregando...</p>
                <p>Carregando...</p>
                <p>Carregando...</p>
              </div>
            ) : templateTasks && templateTasks.length > 0 ? (
              <div className="space-y-3">
                {templateTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                      )}
                      <div className="flex gap-2 mt-2">
                        {task.phaseId !== null && (
                          <Badge variant="secondary" className="text-xs">
                            {phases.find(p=>p.id===task.phaseId)?.name??'Sem fase'}
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            task.priority === 'urgent' ? 'border-red-300 text-red-700' :
                            task.priority === 'high' ? 'border-orange-300 text-orange-700' :
                            task.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                            'border-green-300 text-green-700'
                          }`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium">
                        {task.estimatedHours ? `${task.estimatedHours}h` : '-'}
                      </div>
                      <div className="text-xs text-gray-600">Estimado</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Nenhuma tarefa neste template
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            disabled={!canApply} onClick={onUse}
          >
            Usar Este Template
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate("/templates")}
          >
            Voltar
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
