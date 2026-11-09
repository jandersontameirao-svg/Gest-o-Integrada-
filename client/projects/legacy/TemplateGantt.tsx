// Reused from original TemplateGantt.tsx, with explicit offsets and durations.
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../sge/components/ui/card.tsx';

interface GanttTask {
  id: string;
  name: string;
  phaseId: string;
  phaseName: string;
  startDay: number;
  duration: number;
  order: number;
  color?: string;
}

interface TemplateGanttProps {
  tasks: GanttTask[];
  title?: string;
  compact?: boolean;
}

const PHASE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF',
  '#F5B041', '#D7BDE2', '#85C1E2', '#F8B88B', '#A9DFBF',
  '#F5B041', '#D7BDE2', '#85C1E2', '#F8B88B', '#A9DFBF',
];

export function TemplateGantt({ tasks, title = 'Cronograma do Template', compact = false }: TemplateGanttProps) {
  const ganttData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    // Group tasks by phase
    const phaseMap = new Map<string, GanttTask[]>();
    tasks.forEach(task => {
      if (!phaseMap.has(task.phaseId)) {
        phaseMap.set(task.phaseId, []);
      }
      phaseMap.get(task.phaseId)!.push(task);
    });

    // Create Gantt data
    const data: any[] = [];
    let currentDay = 0;

    phaseMap.forEach((phaseTasks, phaseId) => {
      const phaseName = phaseTasks[0]?.phaseName || `Fase ${phaseId}`;
      const phaseColor = PHASE_COLORS[Array.from(phaseMap.keys()).indexOf(phaseId) % PHASE_COLORS.length];

      phaseTasks.forEach((task, index) => {
        data.push({
          id: task.id,
          name: task.name,
          phase: phaseName,
          start: task.startDay,
          duration: task.duration,
          color: task.color || phaseColor,
          order: task.order || index,
        });
        currentDay = Math.max(currentDay,task.startDay+task.duration);
      });
    });

    return data;
  }, [tasks]);

  if (ganttData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Nenhuma estimativa explícita para desenhar; consulte as atividades sem prazo informado.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={compact ? 'h-64' : 'h-96'}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ganttData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Dias relativos (estimativa)' , position: 'insideBottomRight', offset: -5 }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={190}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                formatter={(value: any) => `${value} dias`}
              />
              <Bar dataKey="start" stackId="plan" fill="transparent" legendType="none" isAnimationActive={false}/>
              <Bar stackId="plan" isAnimationActive={false}
                dataKey="duration" 
                fill="#8884d8" 
                radius={[0, 8, 8, 0]}
              >
                {ganttData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from(new Set(ganttData.map(d => d.phase))).map((phase, index) => (
            <div key={phase} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: ganttData.find(d=>d.phase===phase)?.color??PHASE_COLORS[index % PHASE_COLORS.length] }}
              />
              <span className="text-sm text-gray-700">{phase}</span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total de Tarefas</div>
            <div className="text-2xl font-bold text-blue-600">{ganttData.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Janela relativa estimada</div>
            <div className="text-2xl font-bold text-green-600">
              {Math.max(...ganttData.map(d => d.start+d.duration))} dias relativos
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Fases</div>
            <div className="text-2xl font-bold text-purple-600">
              {Array.from(new Set(ganttData.map(d => d.phase))).length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
