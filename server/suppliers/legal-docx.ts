import {createHash} from 'node:crypto';
import {unzipSync,zipSync,strToU8} from 'fflate';
import {compendiumBaseline,compendiumModels} from '../../shared/suppliers/compendium.ts';
import type {Family} from '../../shared/suppliers/model.ts';
import type {LegalSource} from '../../shared/suppliers/legal.ts';
import {legalTextLimit,legalPlaceholders} from '../../shared/suppliers/legal.ts';
import {validateFile} from '../contracts/files.ts';
import {invalid} from '../contracts/validation.ts';
export const sha=(b:string|Buffer)=>createHash('sha256').update(b).digest('hex');
function decodePoint(s:string){const n=parseInt(s.slice(s[1].toLowerCase()==='x'?2:1),s[1].toLowerCase()==='x'?16:10);if(!Number.isInteger(n)||n<1||n>0x10FFFF||(n>=0xD800&&n<=0xDFFF))invalid('Referência XML inválida.');return String.fromCodePoint(n);}
const decode=(v:string)=>v.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi,(_,s:string)=>s.startsWith('#')?decodePoint(s):({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"}[s.toLowerCase()]!));
export function importCompendium(name:string,mime:string,base64:unknown){
 if(!/\.docx$/i.test(name)||mime!=='application/vnd.openxmlformats-officedocument.wordprocessingml.document')invalid('Importação exige DOCX.');
 if(typeof base64!=='string'||base64.length>Math.ceil(8*1024*1024/3)*4||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64))invalid('Arquivo inválido ou acima de 8 MiB.');
 const bytes=Buffer.from(base64,'base64'),sourceHash=sha(bytes),recognized=sourceHash===compendiumBaseline.sha256;
 // Exceção restrita ao hash exato da fonte autorizada: 583 partes Word; apenas três XML são analisados.
 // Nenhum relacionamento, imagem, comentário ou serviço externo é executado/carregado.
 if(!recognized)validateFile(name,mime,base64,8*1024*1024);
 const entries=unzipSync(bytes);
 if(recognized){const subset=Buffer.from(zipSync(Object.fromEntries(['[Content_Types].xml','_rels/.rels','word/document.xml'].map(k=>[k,entries[k]]))));validateFile(name,mime,subset.toString('base64'),8*1024*1024);}
 let xml=Buffer.from(entries['word/document.xml']).toString('utf8');
 if(/<w:(txbxContent|altChunk|drawing|pict|footnoteReference|endnoteReference)\b|<m:oMath\b/.test(xml))invalid('Conteúdo não textual exige adaptação explícita; o original não será simplificado silenciosamente.');
 xml=xml.replace(/<w:(del|moveFrom)\b[^>]*>[\s\S]*?<\/w:\1>/g,'');
 const paragraphs=[...xml.matchAll(/<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g)].map(m=>[...m[1].matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>|<w:(tab|br|cr)\b[^>]*\/>/g)].map(x=>x[2]?x[2]==='tab'?'\t':'\n':decode(x[1])).join('').trim());
 if(paragraphs.length>20000)invalid('Quantidade de parágrafos excedida.');
 const headings: {index:number;model:string;family:Family;key:string}[]=[];
 for(let i=0;i<paragraphs.length;i++){const m=/^CARGO\s+(\d{1,2})\s*[—–-]\s*(CONTRATO|ANEXO\s+(IV|III|II|I))\b/u.exec(paragraphs[i]);if(!m)continue;const model='cargo-'+m[1].padStart(2,'0');if(!compendiumModels.some(c=>c.id===model))invalid('Escopo do compêndio não reconhecido.');const family:Family=m[2]==='CONTRATO'?'contract':({I:'service_order',II:'measurement',III:'amendment',IV:'indicators'} as const)[m[3] as 'I'|'II'|'III'|'IV'];headings.push({index:i,model,family,key:model+':'+family});}
 if(headings.length!==65||new Set(headings.map(h=>h.key)).size!==65)invalid('Esperados 13 contratos e 52 anexos identificáveis, sem duplicatas.');
 const segments=headings.map((h,i)=>{const end=headings[i+1]?.index??paragraphs.length,body=paragraphs.slice(h.index,end).join('\n').trim();if(body.length>legalTextLimit)invalid('Texto do modelo excede limite.');legalPlaceholders(body);const source:LegalSource={sha256:sourceHash,recognizedCompendium:sourceHash===compendiumBaseline.sha256,selection:'working_revisions',segmentKey:h.key,paragraphStart:h.index+1,paragraphEnd:end,originalTextSHA256:sha(body)};return {key:h.key,modelId:h.model,family:h.family,title:paragraphs[h.index].slice(0,255),body,source};});
 return {bytes,sha256:sourceHash,recognizedCompendium:sourceHash===compendiumBaseline.sha256,paragraphCount:paragraphs.length,segments,warnings:['Texto de trabalho inclui inserções e exclui trechos marcados como removidos; comentários não viram regras.','Layout, numeração automática, tabelas e estilos do Word não são reproduzidos pelo texto gerado. Baixe o DOCX original para conferência integral.']};
}
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));
export function legalDocx(body:string,title:string){const xml=(s:string)=>strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+s);return Buffer.from(zipSync({'[Content_Types].xml':xml('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'),'_rels/.rels':xml('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'),'word/document.xml':xml('<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+['RASCUNHO — SEM ASSINATURA OU EFEITO OPERACIONAL',title,...body.split('\n')].map(p=>'<w:p><w:r><w:t xml:space="preserve">'+escape(p)+'</w:t></w:r></w:p>').join('')+'<w:sectPr/></w:body></w:document>')}));}
