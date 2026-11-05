import type { Principal, ModuleId } from '../shared/catalog.ts';
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export function authorize(user: Principal, companyId: string | undefined, module: ModuleId, action = 'read') {
  if (!companyId) throw new HttpError(400, 'Selecione uma empresa.');
  const permission = module + ':' + action;
  const corporate = user.memberships.some(m => m.isHolding && m.corporate && m.permissions.includes(permission));
  const local = user.memberships.some(m => m.companyId === companyId && m.permissions.includes(permission));
  if (companyId === 'corporate' ? !corporate : !(local || corporate)) throw new HttpError(403, 'Acesso não autorizado.');
  return { corporate: companyId === 'corporate', companyId };
}
export function canCorporate(user: Principal) {
  return user.memberships.some(m => m.isHolding && m.corporate && m.permissions.length > 0);
}
export function visibleCompanyIds(user: Principal): string[] | null {
  return canCorporate(user) ? null : [...new Set(user.memberships.map(m => m.companyId))];
}
