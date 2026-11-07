import {FinanceWorkspace} from './finance/Workspace.tsx';
import {SuppliersWorkspace} from './suppliers/Workspace.tsx';
import {ProjectsWorkspace} from './projects/Workspace.tsx';
import React, {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {modules,type Company,type Principal,type ModuleId} from '../shared/catalog.ts';
import {canCorporate} from '../server/policy.ts';
import './styles.css';
import {ContractsWorkspace} from './contracts/Workspace.tsx';
import {Workspace} from './strategy/Workspace.tsx';
import {Governance} from './Governance.tsx';
type Overview = {demonstration:boolean;scope:string;records:{id:string;companyId:string;label:string}[]};
function Panel({title,children}:{title:string;children:React.ReactNode}) {
 return <section className="panel"><h2>{title}</h2>{children}</section>;
}
function App() {
 const [token,setToken]=useState(''); const [user,setUser]=useState<Principal|null>(null);
 const [companies,setCompanies]=useState<Company[]>([]); const [company,setCompany]=useState('');
 const [module,setModule]=useState<ModuleId>('projects'); const [overview,setOverview]=useState<Overview|null>(null);
 const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
 async function api<T>(path:string,options:RequestInit={},bearer=token,signal?:AbortSignal):Promise<T> {
  const response=await fetch('/api/v1'+path,{...options,signal,headers:{'Content-Type':'application/json',...(bearer?{Authorization:'Bearer '+bearer}:{})}});
  if(response.status===401 && bearer){setToken('');setUser(null);setOverview(null);}
  if(!response.ok){const data=await response.json();throw new Error(data.error??'Falha na solicitação.');}
  return response.status===204 ? undefined as T : response.json();
 }
 async function login(event:React.FormEvent<HTMLFormElement>) {
  event.preventDefault();setLoading(true);setError('');
  const form=new FormData(event.currentTarget);
  try {
   const result=await api<{token:string;user:Principal}>('/auth/login',{method:'POST',body:JSON.stringify({email:form.get('email'),password:form.get('password')})});
   const list=await api<Company[]>('/companies',{},result.token);
   setCompanies(list);setCompany(canCorporate(result.user)?'corporate':list[0]?.id??'');setToken(result.token);setUser(result.user);
  } catch(e){setError((e as Error).message);}finally{setLoading(false);}
 }
 useEffect(()=>{
  if(!token||!company) return;
  const controller=new AbortController();
  setLoading(true);setOverview(null);setError('');
  api<Overview>('/modules/'+module+'/overview?companyId='+encodeURIComponent(company),{},token,controller.signal)
   .then(setOverview).catch(e=>{if(e.name!=='AbortError')setError(e.message);})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return ()=>controller.abort();
 },[token,company,module]);
 useEffect(()=>{if(!token)return;const controller=new AbortController();api<Company[]>('/companies?module='+module,{},token,controller.signal).then(list=>{setCompanies(list);setCompany(current=>current==='corporate'||list.some(c=>c.id===current)?current:list[0]?.id??'');}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>controller.abort();},[token,module]);
 const active=modules.find(m=>m.id===module)!;
 return <><header><div className="brand"><span className="brand-mark" aria-hidden="true">A</span><div><strong>GRUPO ARQUEO</strong><small>GESTÃO INTEGRADA</small></div></div>
 {user&&<div className="account"><span>{user.name}</span><button onClick={async()=>{const leave=new Event('strategy:leave',{cancelable:true});if(!window.dispatchEvent(leave)){setError('Aguarde o salvamento antes de sair.');return;}setError('');try{await api('/auth/logout',{method:'POST'});setToken('');setUser(null);setOverview(null);}catch(e){setError((e as Error).message);}}}>Sair</button></div>}</header>
 <div className="demo">AMBIENTE DE DEMONSTRAÇÃO · Dados sintéticos · Fundação / Comando 01</div>
 {!user?<main className="login"><p className="eyebrow">UMA BASE COMUM PARA O GRUPO</p><h1>Gestão conectada.<br/>Empresas independentes.</h1><p>Acesse seu ambiente de trabalho com sua conta da Gestão Integrada.</p>
 <Panel title="Entrar na plataforma"><form onSubmit={login}><label>E-mail<input name="email" type="email" autoComplete="username" required/></label><label>Senha<input name="password" type="password" autoComplete="current-password" required maxLength={256}/></label><button className="primary" disabled={loading}>{loading?'Entrando…':'Entrar'}</button></form></Panel>
 {error&&<p role="alert" className="error">{error}</p>}</main>:<>
 <nav aria-label="Módulos">{modules.map(m=><button key={m.id} aria-current={m.id===module?'page':undefined} onClick={()=>{const leave=new Event('strategy:leave',{cancelable:true});if(window.dispatchEvent(leave))setModule(m.id);else setError('Aguarde o salvamento antes de mudar módulo.');}}>{m.name}</button>)}</nav>
 <main><div className="context"><div><p className="eyebrow">SEU AMBIENTE DE TRABALHO</p><h1>{company==='corporate'?'Visão corporativa':companies.find(c=>c.id===company)?.name}</h1></div><label>Contexto de acesso<select value={company} onChange={e=>{const leave=new Event('strategy:leave',{cancelable:true});if(window.dispatchEvent(leave))setCompany(e.target.value);else setError('Aguarde o salvamento das análises antes de trocar contexto.');}}>{canCorporate(user)&&<option value="corporate">Grupo Arqueo · Visão corporativa</option>}{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
 <section className="intro"><p className="eyebrow">FUNDAÇÃO MODULAR</p><h2>{active.name}</h2><p>{active.description}</p><span className="badge">Estrutura preparada · Em desenvolvimento</span></section>
 <div className="stats"><Panel title="Empresas no contexto"><strong className="number">{company==='corporate'?companies.length:company?1:0}</strong><p>Acesso conforme suas permissões.</p></Panel><Panel title="Módulos previstos"><strong className="number">05</strong><p>Uma fundação compartilhada.</p></Panel><Panel title="Dados apresentados"><strong className="number">Demo</strong><p>Conteúdo exclusivamente sintético.</p></Panel></div>
 {module==='strategy'&&<Governance token={token} initialScope={company==='corporate'?'scope-holding':'scope-company:'+company}/>}
 {module==='strategy'&&<Workspace key={company} token={token} initialScope={company==='corporate'?'scope-holding':'scope-company:'+company}/>}
 {module==='suppliers'&&<SuppliersWorkspace key={company} token={token} companyId={company} companies={companies}/>}
 {module==='projects'&&<ProjectsWorkspace key={company} token={token} companyId={company} companies={companies}/>}
 {module==='finance'&&<FinanceWorkspace key={company} token={token} companyId={company} companies={companies}/>}
 {module==='contracts'&&<ContractsWorkspace key={company} token={token} companyId={company} companies={companies}/>}
 {module!=='strategy'&&module!=='contracts'&&module!=='projects'&&module!=='suppliers'&&module!=='finance'&&<Panel title="Área do módulo"><p>As funcionalidades de negócio serão implementadas nas próximas etapas. Nenhum módulo legado foi migrado.</p>
 <div aria-live="polite" aria-busy={loading}>{loading&&<p>Carregando contexto…</p>}{error&&<p role="alert" className="error">{error}</p>}
 {overview&&<ul className="records">{overview.records.map(r=><li key={r.id}><span className="dot" aria-hidden="true"/><div><strong>{companies.find(c=>c.id===r.companyId)?.name??r.companyId}</strong><p>{r.label}</p></div><span className="badge">Demonstração</span></li>)}</ul>}</div></Panel>}
 </main></>}<footer>Grupo Arqueo · Gestão Integrada <span>Fundação multiempresa · v0.1</span></footer></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

