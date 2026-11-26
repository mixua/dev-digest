import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getContext } from '../_shared/context.js';
import { IdParams } from '../_shared/schemas.js';
import { ConventionsService } from './service.js';

const PatchBody = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']).optional(),
  rule: z.string().min(1).optional(),
});

/**
 *   POST  /repos/:id/conventions/extract     → run extraction → { candidates, meta }
 *   GET   /repos/:id/conventions             → { candidates, meta }
 *   GET   /repos/:id/conventions/skill-draft → { name, description, body, accepted_count }
 *   PATCH /conventions/:id                   → { status?, rule? } → Candidate
 */
export default async function conventionsRoutes(appBase: FastifyInstance) {
  const app = appBase.withTypeProvider<ZodTypeProvider>();
  const service = new ConventionsService(app.container);

  app.post('/repos/:id/conventions/extract', { schema: { params: IdParams } }, async (req) => {
    const { workspaceId } = await getContext(app.container, req);
    return service.extract(workspaceId, req.params.id);
  });

  app.get('/repos/:id/conventions', { schema: { params: IdParams } }, async (req) => {
    const { workspaceId } = await getContext(app.container, req);
    return service.list(workspaceId, req.params.id);
  });

  app.get('/repos/:id/conventions/skill-draft', { schema: { params: IdParams } }, async (req) => {
    const { workspaceId } = await getContext(app.container, req);
    return service.skillDraft(workspaceId, req.params.id);
  });

  app.patch('/conventions/:id', { schema: { params: IdParams, body: PatchBody } }, async (req) => {
    const { workspaceId } = await getContext(app.container, req);
    return service.patch(workspaceId, req.params.id, req.body);
  });
}
