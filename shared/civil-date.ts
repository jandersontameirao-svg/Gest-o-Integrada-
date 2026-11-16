// Data civil de negócio da Gestão Integrada.
// "Hoje" segue o horário de Brasília, não o UTC: entre 21h e 24h locais o dia UTC já virou,
// o que antecipava vencimentos, alertas, validações de data futura e datas padrão de formulário.
// Carimbos de auditoria (recordedAt, createdAt, expiração de sessão) continuam em UTC.
export const BUSINESS_TIME_ZONE='America/Sao_Paulo';
const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:BUSINESS_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'});
/** Data civil (AAAA-MM-DD) no fuso de negócio para o instante informado; por padrão, agora. */
export function civilToday(now:Date=new Date()):string{
 const parts=Object.fromEntries(formatter.formatToParts(now).map(p=>[p.type,p.value]));
 return parts.year+'-'+parts.month+'-'+parts.day;
}
/** Data civil deslocada em dias inteiros a partir de hoje no fuso de negócio (negativo = passado). */
export function civilDate(offsetDays:number,now:Date=new Date()):string{
 if(!Number.isSafeInteger(offsetDays))throw Error('Deslocamento de dias inválido.');
 const base=new Date(civilToday(now)+'T00:00:00Z');base.setUTCDate(base.getUTCDate()+offsetDays);
 return base.toISOString().slice(0,10);
}
