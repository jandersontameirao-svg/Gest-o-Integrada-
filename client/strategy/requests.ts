import {createScopedRequester} from '../shared/requests.ts';
export function createStrategyRequester(fetcher?:typeof fetch){return createScopedRequester('/api/v1/strategy',fetcher);}
export const request=createStrategyRequester();
