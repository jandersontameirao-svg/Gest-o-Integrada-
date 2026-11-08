// Adaptado do ZIP arqueo-gestao: client/src/components/MSProjectGantt.tsx.
import { useState, useMemo, useRef } from "react";
import { Button } from "../../sge/components/ui/button.tsx";
import { Input } from "../../sge/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../sge/components/ui/select.tsx";
import { ZoomIn, ZoomOut, Filter, ChevronRight, ChevronDown } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Task {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  percentComplete: number;
  predecessors: string;
  parentTaskId: string | null;
  level: number;
  isMilestone: boolean;
  isCritical?: boolean;
}

interface MSProjectGanttProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, field: string, value: any) => Promise<void>;
  onRecalculate: () => Promise<void>;
  canEdit: boolean;
}

type ZoomLevel = "day" | "week" | "month";

export function MSProjectGantt({ tasks, onTaskUpdate, onRecalculate, canEdit }: MSProjectGanttProps) {
  const saving=useRef(false); const [error,setError]=useState(""); const [filter,setFilter]=useState("");
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("week");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);

  // Calculate timeline range
  const { minDate, maxDate } = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      return { minDate: today, maxDate: addDays(today, 30) };
    }
    const dates = tasks.flatMap(t => [t.startDate, t.endDate]);
    const min = new Date(Math.min(...dates.map(d => d.getTime())));
    const max = new Date(Math.max(...dates.map(d => d.getTime())));
    return { minDate: addDays(min, -7), maxDate: addDays(max, 7) };
  }, [tasks]);

  // Generate timeline headers
  const timelineHeaders = useMemo(() => {
    const headers: Date[] = [];
    let current = new Date(minDate);
    const step = zoomLevel === "day" ? 1 : zoomLevel === "week" ? 7 : 30;
    
    while (current <= maxDate) {
      headers.push(new Date(current));
      current = addDays(current, step);
    }
    return headers;
  }, [minDate, maxDate, zoomLevel]);

  const totalDays = differenceInDays(maxDate, minDate);
  const pixelsPerDay = zoomLevel === "day" ? 40 : zoomLevel === "week" ? 20 : 10;

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getVisibleTasks = () => {
    const visible: Task[] = [];
    const addTaskAndChildren = (task: Task) => {
      visible.push(task);
      if (expandedTasks.has(task.id) || task.level === 0) {
        const children = tasks.filter(t => t.parentTaskId === task.id);
        children.forEach(addTaskAndChildren);
      }
    };
    
    tasks.filter(t => t.level === 0).forEach(addTaskAndChildren);
    return visible;
  };

  const visibleTasks = getVisibleTasks().filter(t=>t.title.toLowerCase().includes(filter.toLowerCase()));

  const getBarPosition = (task: Task) => {
    const startOffset = differenceInDays(task.startDate, minDate);
    const duration = differenceInDays(task.endDate, task.startDate)+1;
    return {
      left: startOffset * pixelsPerDay,
      width: Math.max(duration * pixelsPerDay, 2),
    };
  };

  const handleCellEdit = async (taskId: string, field: string, value: string) => {
    if(!canEdit||saving.current)return; saving.current=true;setError("");
    let parsedValue: any = value;
    
    if (field === "duration" || field === "percentComplete") {
      parsedValue = field === "duration" ? Number(value) : parseInt(value) || 0;
    } else if (field === "startDate" || field === "endDate") {
      parsedValue = new Date(value);
    }
    
    try{await onTaskUpdate(taskId, field, parsedValue);setEditingCell(null);}catch(e){setError((e as Error).message);}finally{saving.current=false;}
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
        <Button variant="outline" size="sm" onClick={() => setZoomLevel("day")}>
          <ZoomIn className="h-4 w-4 mr-1" />
          Dia
        </Button>
        <Button variant="outline" size="sm" onClick={() => setZoomLevel("week")}>
          Semana
        </Button>
        <Button variant="outline" size="sm" onClick={() => setZoomLevel("month")}>
          <ZoomOut className="h-4 w-4 mr-1" />
          Mês
        </Button>
        <div className="h-6 w-px bg-gray-300 mx-2" />
        <Input aria-label="Filtrar tarefas no Gantt" value={filter} onChange={e=>setFilter(e.target.value)}/>
        <Button variant="default" size="sm" disabled={!canEdit} onClick={()=>void onRecalculate().catch(e=>setError(e.message))}>
          Recalcular
        </Button>
      </div>

      {error&&<p role="alert">{error}</p>}
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Data Grid */}
        <div className="w-[600px] border-r overflow-auto">
          {/* Column Headers */}
          <div className="flex border-b bg-gray-100 sticky top-0 z-10">
            <div className="w-[250px] px-2 py-2 border-r font-semibold text-sm">Nome da Tarefa</div>
            <div className="w-[80px] px-2 py-2 border-r font-semibold text-sm text-center">Duração</div>
            <div className="w-[100px] px-2 py-2 border-r font-semibold text-sm text-center">Início</div>
            <div className="w-[100px] px-2 py-2 border-r font-semibold text-sm text-center">Término</div>
            <div className="w-[70px] px-2 py-2 font-semibold text-sm text-center">% Concl.</div>
          </div>

          {/* Rows */}
          {visibleTasks.map((task) => {
            const hasChildren = tasks.some(t => t.parentTaskId === task.id);
            const isExpanded = expandedTasks.has(task.id);
            
            return (
              <div key={task.id} className="flex border-b hover:bg-gray-50">
                {/* Task Name */}
                <div className="w-[250px] px-2 py-2 border-r flex items-center" style={{ paddingLeft: `${task.level * 20 + 8}px` }}>
                  {hasChildren && (
                    <button onClick={() => toggleExpand(task.id)} className="mr-1">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  )}
                  {editingCell?.taskId === task.id && editingCell?.field === "title" ? (
                    <Input
                      defaultValue={task.title}
                      onBlur={(e) => handleCellEdit(task.id, "title", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCellEdit(task.id, "title", e.currentTarget.value);
                        if (e.key === "Escape") setEditingCell(null);
                      }}
                      autoFocus
                      className="h-6 text-sm"
                    />
                  ) : (
                    <span
                      className="text-sm cursor-pointer hover:bg-gray-100 px-1 rounded"
                      onClick={() => canEdit&&setEditingCell({ taskId: task.id, field: "title" })}
                    >
                      {task.title}
                    </span>
                  )}
                </div>

                {/* Duration */}
                <div className="w-[80px] px-2 py-2 border-r text-center">
                  {editingCell?.taskId === task.id && editingCell?.field === "duration" ? (
                    <Input
                      type="number"
                      defaultValue={task.duration}
                      onBlur={(e) => handleCellEdit(task.id, "duration", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCellEdit(task.id, "duration", e.currentTarget.value);
                        if (e.key === "Escape") setEditingCell(null);
                      }}
                      autoFocus
                      className="h-6 text-sm text-center"
                    />
                  ) : (
                    <span
                      className="text-sm cursor-pointer hover:bg-gray-100 px-1 rounded"
                      onClick={() => canEdit&&setEditingCell({ taskId: task.id, field: "duration" })}
                    >
                      {task.duration}d
                    </span>
                  )}
                </div>

                {/* Start Date */}
                <div className="w-[100px] px-2 py-2 border-r text-center text-sm">
                  {format(task.startDate, "dd/MM/yyyy")}
                </div>

                {/* End Date */}
                <div className="w-[100px] px-2 py-2 border-r text-center text-sm">
                  {format(task.endDate, "dd/MM/yyyy")}
                </div>

                {/* Percent Complete */}
                <div className="w-[70px] px-2 py-2 text-center">
                  {editingCell?.taskId === task.id && editingCell?.field === "percentComplete" ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={task.percentComplete}
                      onBlur={(e) => handleCellEdit(task.id, "percentComplete", e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCellEdit(task.id, "percentComplete", e.currentTarget.value);
                        if (e.key === "Escape") setEditingCell(null);
                      }}
                      autoFocus
                      className="h-6 text-sm text-center"
                    />
                  ) : (
                    <span
                      className="text-sm cursor-pointer hover:bg-gray-100 px-1 rounded"
                      onClick={() => canEdit&&setEditingCell({ taskId: task.id, field: "percentComplete" })}
                    >
                      {task.percentComplete}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Panel - Timeline */}
        <div className="flex-1 overflow-auto">
          {/* Timeline Header */}
          <div className="flex border-b bg-gray-100 sticky top-0 z-10">
            {timelineHeaders.map((date, i) => (
              <div
                key={i}
                className="border-r px-2 py-2 text-xs font-semibold text-center"
                style={{ minWidth: `${pixelsPerDay * (zoomLevel === "day" ? 1 : zoomLevel === "week" ? 7 : 30)}px` }}
              >
                {format(date, zoomLevel === "day" ? "dd/MM" : zoomLevel === "week" ? "dd/MM" : "MMM/yy", { locale: ptBR })}
              </div>
            ))}
          </div>

          {/* Timeline Grid */}
          <div className="relative">
            {/* Vertical Grid Lines */}
            {timelineHeaders.map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 border-r border-gray-200"
                style={{ left: `${i * pixelsPerDay * (zoomLevel === "day" ? 1 : zoomLevel === "week" ? 7 : 30)}px` }}
              />
            ))}

            {/* Today Line */}
            {(() => {
              const today = new Date();
              if (today >= minDate && today <= maxDate) {
                const offset = differenceInDays(today, minDate) * pixelsPerDay;
                return (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                    style={{ left: `${offset}px` }}
                  />
                );
              }
              return null;
            })()}

            {/* Task Bars */}
            {visibleTasks.map((task, index) => {
              const { left, width } = getBarPosition(task);
              const isSummary = tasks.some(t => t.parentTaskId === task.id);
              
              return (
                <div
                  key={task.id}
                  className="absolute h-8 flex items-center"
                  style={{ top: `${index * 33}px`, left: `${left}px`, width: `${width}px` }}
                >
                  {task.isMilestone ? (
                    <div className={`w-4 h-4 ${task.isCritical?'bg-red-600':'bg-blue-600'} transform rotate-45`} />
                  ) : (
                    <div className="relative w-full h-5">
                      <div
                        className={`h-full rounded ${
                          isSummary ? "bg-gray-800" : task.isCritical ? "bg-red-600" : "bg-blue-500"
                        } shadow-sm`}
                      />
                      {task.percentComplete > 0 && (
                        <div
                          className="absolute top-0 left-0 h-full bg-blue-700 rounded"
                          style={{ width: `${task.percentComplete}%` }}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Spacer for height */}
            <div style={{ height: `${visibleTasks.length * 33}px` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
