import type { Principal, Membership } from '../shared/catalog.ts';
import { rows } from './db.ts';
import { digestToken } from './crypto.ts';
import { HttpError } from './policy.ts';
export async function loadPrincipal(id: string): Promise<Principal> {
 const users = await rows<{id:string; name:string}>('SELECT id, name FROM users WHERE id = ? AND active = 1', [id]);
 if (!users[0]) throw new HttpError(401, 'Sessão inválida.');
 const memberships = await rows<{companyId:string; roleId:string; corporate:number; isHolding:number; permission:string|null}>(
  `SELECT m.company_id companyId, m.role_id roleId, m.corporate, c.is_holding isHolding,
    rp.permission FROM memberships m JOIN companies c ON c.id=m.company_id
    LEFT JOIN role_permissions rp ON rp.role_id=m.role_id WHERE m.user_id=?`, [id]);
 const grouped = new Map<string, Membership>();
 for (const m of memberships) {
  let entry = grouped.get(m.companyId);
  if (!entry) { entry = {companyId:m.companyId, roleId:m.roleId, corporate:!!m.corporate, isHolding:!!m.isHolding, permissions:[]}; grouped.set(m.companyId, entry); }
  if (m.permission) entry.permissions.push(m.permission);
 }
 return {...users[0], memberships:[...grouped.values()]};
}
export async function authenticate(header?: string): Promise<Principal> {
 if (!header?.startsWith('Bearer ') || header.length > 200) throw new HttpError(401, 'Autenticação necessária.');
 const sessions = await rows<{user_id:string}>('SELECT user_id FROM sessions WHERE token_hash=? AND expires_at > UTC_TIMESTAMP()', [digestToken(header.slice(7))]);
 if (!sessions[0]) throw new HttpError(401, 'Sessão inválida ou expirada.');
 return loadPrincipal(sessions[0].user_id);
}

