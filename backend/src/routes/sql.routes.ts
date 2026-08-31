// routes/sql.routes.ts — Console SQL exclusivo do Root
import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkRoot } from '../middleware/role.middleware';
import { query } from '../config/database';
import { LogRepository } from '../repositories/LogRepository';

const router = Router();
router.use(authMiddleware, checkRoot);

// Blocos de SQL que nunca podem ser executados (segurança mínima)
const BLOCKED_PATTERNS = [
  /drop\s+database/i,
  /drop\s+schema/i,
  /pg_read_file/i,
  /copy\s+.*\s+to\s+/i,
];

router.post('/exec', async (req: Request, res: Response) => {
  const { sql: rawSql } = req.body as { sql?: string };

  if (!rawSql || typeof rawSql !== 'string' || !rawSql.trim()) {
    return res.status(400).json({ error: 'SQL vazio' });
  }

  const sql = rawSql.trim();

  // Verificação de bloqueios
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(sql)) {
      return res.status(403).json({ error: 'Comando bloqueado por segurança.' });
    }
  }

  const startedAt = Date.now();

  try {
    const result = await query(sql, []);
    const elapsed = Date.now() - startedAt;

    // Registrar no log de auditoria
    await LogRepository.registrar({
      usuario_id: null,
      tipo_evento: 'ROOT_SQL',
      descricao: sql.length > 300 ? sql.substring(0, 300) + '…' : sql,
    });

    return res.json({
      rows: result.rows,
      rowCount: result.rowCount,
      command: result.command,
      elapsed_ms: elapsed,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return res.status(400).json({ error: msg, elapsed_ms: Date.now() - startedAt });
  }
});

export default router;
