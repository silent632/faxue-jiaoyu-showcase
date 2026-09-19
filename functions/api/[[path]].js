import { handleRequest } from '../../server/router.js';
export function onRequest({ request, env }) { return handleRequest(request, env); }
