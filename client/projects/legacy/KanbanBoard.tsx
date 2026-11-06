// Adaptado do ZIP arqueo-gestao: client/src/components/KanbanBoard.tsx; colunas droppable e commit aguardado.
import { useState, useMemo } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "../../sge/components/ui/card.tsx";
import { Badge } from "../../sge/components/ui/badge.tsx";
import { Input } from "../../sge/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../sge/components/ui/select.tsx";
import { Search, Filter } from "lucide-react";

interface ProjectStatus {
  id: string;
  name: string;
  order: number;
  color: string;
  isActive: boolean;
}

interface KanbanProject {
  id: string;
  name: string;
  statusId: string;
  clientName?: string;
  managerName?: string;
  progress: number;
  risk?: "low" | "medium" | "high";
  startDate?: Date;
  endDate?: Date;
}

interface KanbanBoardProps {
  statuses: ProjectStatus[];
  projects: KanbanProject[];
  onProjectMove: (projectId: string, newStatusId: string) => Promise<void>;
  canEdit:boolean;
}

function ProjectCard({ project }: { project: KanbanProject }) {
  const riskColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <Card className="mb-3 cursor-move hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {project.clientName && (
          <p className="text-xs text-muted-foreground">Cliente: {project.clientName}</p>
        )}
        {project.managerName && (
          <p className="text-xs text-muted-foreground">Gestor: {project.managerName}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Progresso</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
          {project.risk && (
            <Badge className={`ml-2 ${riskColors[project.risk]}`}>
              {project.risk === "low" && "Baixo"}
              {project.risk === "medium" && "Médio"}
              {project.risk === "high" && "Alto"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SortableProjectCard({ project }: { project: KanbanProject }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ProjectCard project={project} />
    </div>
  );
}

function KanbanColumn({
  status,
  projects,
}: {
  status: ProjectStatus;
  projects: KanbanProject[];
}) {
  const {setNodeRef}=useDroppable({id:status.id});
  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80">
      <div
        className="rounded-lg p-4 h-full"
        style={{ backgroundColor: `${status.color}15`, borderTop: `3px solid ${status.color}` }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">{status.name}</h3>
          <Badge variant="secondary">{projects.length}</Badge>
        </div>
        <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {projects.map((project) => (
              <SortableProjectCard key={project.id} project={project} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoard({ statuses, projects, onProjectMove, canEdit }: KanbanBoardProps) {
  const [error,setError]=useState(""),[saving,setSaving]=useState(false);
  const [activeProject, setActiveProject] = useState<KanbanProject | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filtrar projetos
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClient = filterClient === "all" || project.clientName === filterClient;
      const matchesRisk = filterRisk === "all" || project.risk === filterRisk;
      return matchesSearch && matchesClient && matchesRisk;
    });
  }, [projects, searchTerm, filterClient, filterRisk]);

  // Agrupar projetos por status
  const projectsByStatus = useMemo(() => {
    const grouped: Record<string, KanbanProject[]> = {};
    statuses.forEach((status) => {
      grouped[status.id] = filteredProjects.filter((p) => p.statusId === status.id);
    });
    return grouped;
  }, [statuses, filteredProjects]);

  // Clientes únicos para filtro
  const uniqueClients = useMemo(() => {
    const clients = new Set(projects.map((p) => p.clientName).filter(Boolean));
    return Array.from(clients) as string[];
  }, [projects]);

  function handleDragStart(event: DragStartEvent) {
    const project = projects.find((p) => p.id === event.active.id);
    setActiveProject(project || null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveProject(null);

    if (!over||!canEdit||saving) return;

    const projectId = String(active.id);
    const newStatusId = statuses.some(s=>s.id===String(over.id))?String(over.id):projects.find(p=>p.id===String(over.id))?.statusId;
    if(!newStatusId)return;

    const project = projects.find((p) => p.id === projectId);
    if (project && project.statusId !== newStatusId) {
      setSaving(true);setError("");try{await onProjectMove(projectId,newStatusId);}catch(e){setError((e as Error).message);}finally{setSaving(false);}
    }
  }

  return (
    <div className="space-y-4">
      {error&&<p role="alert">{error}</p>}
      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {uniqueClients.map((client) => (
                  <SelectItem key={client} value={client}>
                    {client}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os riscos</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quadro Kanban */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses
            .filter((s) => s.isActive)
            .sort((a, b) => a.order - b.order)
            .map((status) => (
              <SortableContext key={status.id} items={[status.id]} strategy={verticalListSortingStrategy}>
                <div data-status-id={status.id}>
                  <KanbanColumn status={status} projects={projectsByStatus[status.id] || []} />
                </div>
              </SortableContext>
            ))}
        </div>
        <DragOverlay>{activeProject && <ProjectCard project={activeProject} />}</DragOverlay>
      </DndContext>
    </div>
  );
}
