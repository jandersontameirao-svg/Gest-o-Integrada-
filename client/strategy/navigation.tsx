import type {ReactNode,MouseEvent} from 'react';
import {useStrategy} from './context.tsx';
export function useLocation():[string,(path:string)=>void]{const c=useStrategy();return ['',c.navigate];}
export function useRoute(_pattern:string){const c=useStrategy();return [true,{id:c.data.plan.scope_id}] as const;}
export function Link({href,children,...props}:{href:string;children:ReactNode;className?:string}){const c=useStrategy();return <a {...props} href={'#'+href} onClick={(e:MouseEvent)=>{e.preventDefault();c.navigate(href);}}>{children}</a>;}
