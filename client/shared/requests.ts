// Share only simultaneous identical GETs within the same bearer context. No completed cache.
// Writes invalidate that context before and after the request, so post-write refreshes are fresh.
export function createScopedRequester(basePath:string,fetcher:typeof fetch=(input,init)=>fetch(input,init)){
 const pending=new Map<string,Map<string,Promise<unknown>>>();
 return function request<T>(token:string,path:string,method='GET',body?:unknown):Promise<T>{
  const read=method==='GET'&&body===undefined;let scope=pending.get(token);
  const normalized=new URL(path,'http://gi.invalid');normalized.searchParams.sort();const key=normalized.pathname+normalized.search;if(read&&scope?.has(key))return scope.get(key)! as Promise<T>;
  if(!read)pending.delete(token);
  const promise=(async()=>{const r=await fetcher(basePath+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})});const raw=await r.text();let json:unknown;try{json=JSON.parse(raw);}catch{throw Error('Falha na operação. HTTP '+r.status);}if(!r.ok)throw Error(json&&typeof json==='object'&&'error'in json?String(json.error):'Falha na operação. HTTP '+r.status);return json as T;})();
  if(read){if(!scope){scope=new Map();pending.set(token,scope);}scope.set(key,promise);const current=scope;const clean=()=>{if(current.get(key)===promise)current.delete(key);if(!current.size&&pending.get(token)===current)pending.delete(token);};void promise.then(clean,clean);}else{const clear=()=>pending.delete(token);void promise.then(clear,clear);}
  return promise;
 };
}
export const scopedJson=createScopedRequester('/api/v1');
