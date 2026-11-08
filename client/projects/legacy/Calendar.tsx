// Adapted from original arqueo-gestao Calendar.tsx; see 08B provenance.
import type {ReactNode} from "react";
import type {Project,ProjectRecord} from "../../../shared/projects/model.ts";
function DashboardLayout({children}:{children:ReactNode}){return <div>{children}</div>;}
import { Button } from "../../sge/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../sge/components/ui/card.tsx";
import { Badge } from "../../sge/components/ui/badge.tsx";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Circle
} from "lucide-react";
import { useState, useMemo } from "react";

const civilDate=(value:string)=>{const [year,month,day]=value.split('-').map(Number);return new Date(year,month-1,day,12);};
const dayKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
};

const statusIcons: Record<string, React.ReactNode> = {
  backlog: <Circle className="h-3 w-3 text-gray-400" />,
  todo: <Circle className="h-3 w-3 text-blue-500" />,
  in_progress: <Clock className="h-3 w-3 text-amber-500" />,
  review: <AlertCircle className="h-3 w-3 text-purple-500" />,
  done: <CheckCircle className="h-3 w-3 text-emerald-500" />,
  blocked: <AlertCircle className="h-3 w-3 text-red-500" />,
};

interface CalendarTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | string | null;
  projectId: string;
  projectName?: string | null;
}

export default function Calendar({project,records,onEdit}:{project:Project;records:ProjectRecord[];onEdit:(id:string)=>void}) {
  const tasks:CalendarTask[]=records.filter(r=>r.kind==='task').map(r=>({id:r.id,title:String(r.payload.title),status:String(r.payload.status),priority:String(r.payload.priority),dueDate:String(r.payload.endDate),projectId:project.id,projectName:project.payload.name}));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  

  
  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();
    
    // Days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Previous month days to show
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    const days: { date: Date; isCurrentMonth: boolean; tasks: CalendarTask[] }[] = [];
    
    // Previous month days
    for (let i = startingDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date,
        isCurrentMonth: false,
        tasks: getTasksForDate(date),
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        tasks: getTasksForDate(date),
      });
    }
    
    // Next month days to fill grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        tasks: getTasksForDate(date),
      });
    }
    
    return days;
  }, [currentDate, tasks]);
  
  function getTasksForDate(date: Date): CalendarTask[] {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = civilDate(String(task.dueDate));
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    }) as CalendarTask[];
  }
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  // Get tasks for selected date
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  
  // Get upcoming tasks (next 7 days)
  const upcomingTasks = useMemo(() => {
    if (!tasks) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = civilDate(String(task.dueDate));
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= today && taskDate <= nextWeek && task.status !== 'done';
    }).sort((a, b) => {
      const dateA = civilDate(String(a.dueDate));
      const dateB = civilDate(String(b.dueDate));
      return dateA.getTime() - dateB.getTime();
    }).slice(0, 10) as CalendarTask[];
  }, [tasks]);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <label>Ir ao mês<input aria-label="Ir ao mês" type="month" value={`${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}`} onChange={e=>{if(e.target.value){const [y,m]=e.target.value.split('-').map(Number);setCurrentDate(new Date(y,m-1,1,12));setSelectedDate(null);}}}/></label>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Calendário de Tarefas</h1>
            <p className="text-muted-foreground">
              Projeto {project.payload.name}: atividades canônicas organizadas por data de entrega
            </p>
          </div>
          <Button onClick={goToToday} variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Hoje
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-3 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-1">
                  <Button aria-label="Mês anterior" variant="ghost" size="icon" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button aria-label="Próximo mês" variant="ghost" size="icon" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              {/* Days of week header */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS_OF_WEEK.map(day => (
                  <div 
                    key={day} 
                    className="text-center text-xs font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarData.map((day, index) => (
                  <button
                    key={index} aria-label={`Dia ${dayKey(day.date)}`} aria-pressed={isSelected(day.date)}
                    onClick={() => setSelectedDate(day.date)}
                    className={`
                      min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 rounded-lg text-left transition-all
                      ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-muted-foreground'}
                      ${isToday(day.date) ? 'ring-2 ring-amber-500' : ''}
                      ${isSelected(day.date) ? 'bg-amber-50 ring-2 ring-amber-400' : ''}
                      hover:bg-gray-100
                    `}
                  >
                    <div className={`
                      text-sm font-medium mb-1
                      ${isToday(day.date) ? 'text-amber-600' : ''}
                    `}>
                      {day.date.getDate()}
                    </div>
                    
                    {/* Task indicators */}
                    <div className="space-y-0.5">
                      {day.tasks.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className={`
                            text-[10px] sm:text-xs px-1 py-0.5 rounded truncate
                            ${priorityColors[task.priority]}
                          `}
                          title={task.title}
                        >
                          <span className="hidden sm:inline">{task.title}</span>
                          <span className="sm:hidden">•</span>
                        </div>
                      ))}
                      {day.tasks.length > 3 && (
                        <div className="text-[10px] text-muted-foreground text-center">
                          +{day.tasks.length - 3}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Tasks */}
            {selectedDate && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-amber-500" />
                    {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDateTasks.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDateTasks.map(task => (
                        <div
                          key={task.id}
                          className="p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                          role="button" tabIndex={0} aria-label={`Abrir atividade ${task.title}`} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onEdit(task.id);}}} onClick={() => onEdit(task.id)}
                        >
                          <div className="flex items-start gap-2">
                            {statusIcons[task.status]}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{task.title}</p>
                              {task.projectName && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {task.projectName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma tarefa para este dia
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Próximas Tarefas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingTasks.map(task => {
                      const dueDate = civilDate(String(task.dueDate));
                      const isOverdue = dayKey(dueDate) < dayKey(new Date());
                      
                      return (
                        <div
                          key={task.id}
                          className="p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                          role="button" tabIndex={0} aria-label={`Abrir atividade ${task.title}`} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onEdit(task.id);}}} onClick={() => onEdit(task.id)}
                        >
                          <div className="flex items-start gap-2">
                            {statusIcons[task.status]}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                                  {dueDate.getDate()}/{dueDate.getMonth() + 1}
                                </span>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-[10px] px-1 py-0 ${priorityColors[task.priority]}`}
                                >
                                  {task.priority === 'urgent' ? 'Urgente' :
                                   task.priority === 'high' ? 'Alta' :
                                   task.priority === 'medium' ? 'Média' : 'Baixa'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma tarefa nos próximos 7 dias
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Legenda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-slate-200" />
                    <span>Baixa prioridade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-200" />
                    <span>Média prioridade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-200" />
                    <span>Alta prioridade</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-200" />
                    <span>Urgente</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
