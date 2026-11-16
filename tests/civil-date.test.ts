import {test} from 'node:test';
import assert from 'node:assert/strict';
import {civilToday,civilDate,BUSINESS_TIME_ZONE} from '../shared/civil-date.ts';
test('data civil segue o horário de Brasília, independentemente do fuso do processo',()=>{
 assert.equal(BUSINESS_TIME_ZONE,'America/Sao_Paulo');
 // 23h30 de 15/11 em Brasília já é 16/11 em UTC: o dia de negócio continua sendo 15/11.
 assert.equal(civilToday(new Date('2026-11-16T02:30:00Z')),'2026-11-15');
 assert.equal(civilToday(new Date('2026-11-16T02:59:59Z')),'2026-11-15');
 assert.equal(civilToday(new Date('2026-11-16T03:00:00Z')),'2026-11-16');
 assert.equal(civilToday(new Date('2026-11-16T15:00:00Z')),'2026-11-16');
 // Virada de ano e de mês.
 assert.equal(civilToday(new Date('2027-01-01T01:00:00Z')),'2026-12-31');
 assert.equal(civilToday(new Date('2026-03-01T02:00:00Z')),'2026-02-28');
 const before=process.env.TZ;
 try{for(const tz of ['UTC','Asia/Tokyo','America/Los_Angeles']){process.env.TZ=tz;assert.equal(civilToday(new Date('2026-11-16T02:30:00Z')),'2026-11-15');}}
 finally{if(before===undefined)delete process.env.TZ;else process.env.TZ=before;}
});
test('deslocamento em dias usa o calendário civil e rejeita valores não inteiros',()=>{
 const now=new Date('2026-11-16T02:30:00Z');
 assert.equal(civilDate(0,now),'2026-11-15');
 assert.equal(civilDate(-1,now),'2026-11-14');
 assert.equal(civilDate(1,now),'2026-11-16');
 assert.equal(civilDate(16,now),'2026-12-01');
 assert.equal(civilDate(-365,new Date('2028-03-01T12:00:00Z')),'2027-03-02');
 assert.throws(()=>civilDate(0.5,now),/inválido/);
});
