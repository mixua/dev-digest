import { and, desc, eq, inArray } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import * as t from '../../db/schema.js';

export type ConventionRow = typeof t.conventions.$inferSelect;
export type InsertConvention = typeof t.conventions.$inferInsert;

/** Data access for `conventions` (+ repo lookup). Workspace-scoped. */
export class ConventionsRepository {
  constructor(private db: Db) {}

  async getRepo(workspaceId: string, repoId: string) {
    const [row] = await this.db
      .select()
      .from(t.repos)
      .where(and(eq(t.repos.id, repoId), eq(t.repos.workspaceId, workspaceId)));
    return row;
  }

  /** Newest first. */
  listByRepo(workspaceId: string, repoId: string): Promise<ConventionRow[]> {
    return this.db
      .select()
      .from(t.conventions)
      .where(and(eq(t.conventions.workspaceId, workspaceId), eq(t.conventions.repoId, repoId)))
      .orderBy(desc(t.conventions.createdAt));
  }

  async deletePending(workspaceId: string, repoId: string): Promise<void> {
    await this.db
      .delete(t.conventions)
      .where(
        and(
          eq(t.conventions.workspaceId, workspaceId),
          eq(t.conventions.repoId, repoId),
          eq(t.conventions.status, 'pending'),
        ),
      );
  }

  async insertMany(rows: InsertConvention[]): Promise<ConventionRow[]> {
    if (!rows.length) return [];
    return this.db.insert(t.conventions).values(rows).returning();
  }

  async update(
    workspaceId: string,
    id: string,
    patch: Partial<Pick<ConventionRow, 'status' | 'accepted' | 'rule'>>,
  ): Promise<ConventionRow | undefined> {
    const [row] = await this.db
      .update(t.conventions)
      .set(patch)
      .where(and(eq(t.conventions.id, id), eq(t.conventions.workspaceId, workspaceId)))
      .returning();
    return row;
  }

  listByStatus(workspaceId: string, repoId: string, statuses: ConventionRow['status'][]) {
    return this.db
      .select()
      .from(t.conventions)
      .where(
        and(
          eq(t.conventions.workspaceId, workspaceId),
          eq(t.conventions.repoId, repoId),
          inArray(t.conventions.status, statuses),
        ),
      );
  }
}
