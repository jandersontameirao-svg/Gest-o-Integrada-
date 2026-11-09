import type {jsPDF} from 'jspdf';
import type {ProjectReport} from '../../shared/projects/reports.ts';
/** Printed charts are built from the same immutable dataset as the tables. */
export function drawReportVisual(doc:jsPDF,report:ProjectReport){
 const groups=new Map<string,NonNullable<ProjectReport['phaseSummary']>>();for(const p of report.phaseSummary??[]){const items=groups.get(p.projectId);if(items)items.push(p);else groups.set(p.projectId,[p]);}
 for(const items of groups.values())for(let offset=0;offset<items.length;offset+=12){doc.addPage();doc.setFontSize(13);doc.text('Execução por fase — atividades folha',14,15);doc.setFontSize(8);doc.text(doc.splitTextToSize(items[0].projectName,260),14,24);const rows=items.slice(offset,offset+12),max=Math.max(1,...items.map(p=>p.total));rows.forEach((p,i)=>{const y=36+i*12;doc.text(doc.splitTextToSize(p.phaseName,80).slice(0,2),14,y+3);let x=100;for(const [key,color] of [['todo',[148,163,184]],['inProgress',[36,84,129]],['review',[237,117,1]],['done',[56,129,91]]] as const){const w=p[key]/max*145;doc.setFillColor(color[0],color[1],color[2]);if(w)doc.rect(x,y,w,5,'F');x+=w;}doc.text(String(p.total),250,y+4);});doc.text('Cinza: a fazer. Azul: em andamento. Laranja: em revisão. Verde: concluídas. Não é progresso físico.',14,195);}
 const visual=report.visual;if(!visual)return;
 if(visual.kind==='gantt'){
  if(!visual.bars.length)return;
  const dates=visual.bars.flatMap(b=>[Date.parse(b.start),Date.parse(b.end)]),min=Math.min(...dates),max=Math.max(...dates)+86400000,span=max-min;
  for(let offset=0;offset<visual.bars.length;offset+=12){doc.addPage();doc.setFontSize(13);doc.text('Gantt persistido — '+report.title,14,15);doc.setFontSize(8);doc.text(new Date(min).toISOString().slice(0,10),104,24);doc.text(new Date(max-86400000).toISOString().slice(0,10),262,24,{align:'right'});
   visual.bars.slice(offset,offset+12).forEach((b,i)=>{const y=34+i*12,x=104+(Date.parse(b.start)-min)/span*158,w=Math.max(1,((Date.parse(b.end)+86400000-Date.parse(b.start))/span)*158);doc.setTextColor(40,40,40);doc.text(doc.splitTextToSize(b.label,85).slice(0,2),14,y+3);doc.setFillColor(b.critical?139:36,b.critical?21:84,b.critical?56:129);doc.rect(x,y,w,5,'F');doc.setFillColor(237,117,1);doc.rect(x,y+6,w*Math.max(0,Math.min(100,b.progress))/100,2,'F');});
   doc.text('Bordô: atividade crítica na prévia CPM. Laranja: progresso declarado. Datas completas na tabela.',14,195);
  }
 }else if(visual.points.length){
  doc.addPage();doc.setFontSize(13);doc.text('Burndown — referência e observações persistidas',14,15);
  const points=visual.points,values=points.flatMap(p=>[p.actual,p.ideal]).filter((n):n is number=>n!==null),max=Math.max(1,...values),x=(i:number)=>25+i/Math.max(1,points.length-1)*240,y=(n:number)=>175-n/max*140;
  doc.setDrawColor(160);doc.line(25,35,25,175);doc.line(25,175,265,175);doc.setFontSize(8);doc.text(String(max),15,35);doc.text('0',18,175);doc.text(points[0].date,25,184);doc.text(points.at(-1)!.date,265,184,{align:'right'});
  for(const key of ['ideal','actual'] as const){const rgb=key==='ideal'?[150,150,150]:[36,84,129];doc.setDrawColor(rgb[0],rgb[1],rgb[2]);doc.setFillColor(rgb[0],rgb[1],rgb[2]);let previous:{x:number;y:number}|null=null;
   points.forEach((p,i)=>{const v=p[key];if(v===null){previous=null;return;}const at={x:x(i),y:y(v)};if(previous)doc.line(previous.x,previous.y,at.x,at.y);doc.circle(at.x,at.y,key==='actual'?1:.5,'F');previous=at;});
  }doc.text('Cinza: ideal (planejamento). Azul: restante observado. Lacunas não são interpoladas; zero é observação válida.',14,195);
 }
}
