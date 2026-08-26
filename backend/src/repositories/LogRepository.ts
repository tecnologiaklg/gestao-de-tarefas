// repositories/LogRepository.ts
import { query } from '../config/database';
import { Log } from '../types';

export interface RegistrarLogData {
  usuario_id?: number | null;
  tipo_evento: string;
  descricao?: string | null;
  valor_antes?: string | null;
  valor_depois?: string | null;
}

export const LogRepository = {
  registrar: async (data: RegistrarLogData): Promise<void> => {
    await query(
      `INSERT INTO logs (usuario_id, tipo_evento, descricao, valor_antes, valor_depois)
       VALUES ($1,$2,$3,$4,$5)`,
      [data.usuario_id ?? null, data.tipo_evento, data.descricao ?? null, data.valor_antes ?? null, data.valor_depois ?? null]
    );
  },

  findAll: async ({ usuario_id, tipo_evento }: { usuario_id?: number; tipo_evento?: string } = {}): Promise<Log[]> => {
    const params: unknown[] = [];
    let sql = `SELECT l.*, u.nome AS usuario_nome FROM logs l
               LEFT JOIN usuarios u ON u.id = l.usuario_id WHERE 1=1`;
    if (usuario_id) { params.push(usuario_id); sql += ` AND l.usuario_id = $${params.length}`; }
    if (tipo_evento) { params.push(tipo_evento); sql += ` AND l.tipo_evento = $${params.length}`; }
    sql += ' ORDER BY l.criado_em DESC LIMIT 500';
    const { rows } = await query<Log>(sql, params);
    return rows;
  },
};
