import type {jsPDF} from 'jspdf';
import type {ProjectReport} from '../../shared/projects/reports.ts';
/** Printed charts are built from the same immutable dataset as the tables. */
export function drawReportVisual(doc:jsPDF,report:ProjectReport){
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
