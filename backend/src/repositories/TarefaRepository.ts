// repositories/TarefaRepository.ts
import { query } from '../config/database';
import { Tarefa, KpiData } from '../types';
import { Prioridade } from '../models/enums';

export interface TarefaFilters {
  search?: string;
  prioridade?: string;
  prazo?: string;
}

export interface CreateTarefaData {
  titulo: string;
  descricao: string;
  criador_id: number;
  responsavel_id: number;
  setor_id: number;
  prioridade: Prioridade;
  prazo: string;
}

const BASE_SELECT = `
  SELECT
    t.id, t.titulo, t.descricao, t.prioridade, t.status,
    t.prazo, t.criado_em, t.concluido_em,
    t.criador_id, u_cri.nome AS criador_nome,
    t.responsavel_id, u_res.nome AS responsavel_nome, u_res.cargo AS responsavel_cargo,
    t.setor_id, s.nome AS setor_nome,
    (t.prazo < NOW() AND t.status != 'CONCLUIDA') AS atrasada,
    COALESCE(t.aviso_atraso_enviado, FALSE) AS aviso_atraso_enviado
  FROM tarefas t
  JOIN usuarios u_cri ON u_cri.id = t.criador_id
  JOIN usuarios u_res ON u_res.id = t.responsavel_id
  JOIN setores  s     ON s.id     = t.setor_id
`;

function applyFilters(sql: string, params: unknown[], { search, prioridade, prazo }: TarefaFilters): string {
  if (search) {
    params.push(`%${search}%`);
    sql += ` AND t.titulo ILIKE $${params.length}`;
  }
  if (prioridade) {
    params.push(prioridade);
    sql += ` AND t.prioridade = $${params.length}`;
  }
  if (prazo) {
    params.push(prazo);
    sql += ` AND DATE(t.prazo) = $${params.length}`;
  }
  return sql;
}

export const TarefaRepository = {
  findById: async (id: number): Promise<Tarefa | null> => {
    const { rows } = await query<Tarefa>(`${BASE_SELECT} WHERE t.id = $1`, [id]);
    return rows[0] ?? null;
  },

  findMinhasTarefas: async (userId: number, filters: TarefaFilters = {}): Promise<Tarefa[]> => {
    const params: unknown[] = [userId];
    let sql = applyFilters(`${BASE_SELECT} WHERE t.responsavel_id = $1`, params, filters);
    sql += ' ORDER BY t.criado_em DESC';
    const { rows } = await query<Tarefa>(sql, params);
    return rows;
  },

  findCriadasPorMim: async (userId: number, filters: TarefaFilters = {}): Promise<Tarefa[]> => {
    const params: unknown[] = [userId];
    let sql = applyFilters(`${BASE_SELECT} WHERE t.criador_id = $1`, params, filters);
    sql += ' ORDER BY t.criado_em DESC';
    const { rows } = await query<Tarefa>(sql, params);
    return rows;
  },

  findBySetor: async (setorId: number, filters: TarefaFilters = {}): Promise<Tarefa[]> => {
    const params: unknown[] = [setorId];
    let sql = applyFilters(`${BASE_SELECT} WHERE t.setor_id = $1 AND u_res.cargo = 'FUNCIONARIO'`, params, filters);
    sql += ' ORDER BY t.criado_em DESC';
    const { rows } = await query<Tarefa>(sql, params);
    return rows;
  },

  // Todas as tarefas onde o usuário é responsável OU criador (sem duplicatas)
  findTodasDoUsuario: async (userId: number, filters: TarefaFilters = {}): Promise<Tarefa[]> => {
    const params: unknown[] = [userId];
    let sql = applyFilters(
      `${BASE_SELECT} WHERE (t.responsavel_id = $1 OR t.criador_id = $1)`,
      params,
      filters
    );
    sql += ' ORDER BY t.criado_em DESC';
    const { rows } = await query<Tarefa>(sql, params);
    return rows;
  },

  create: async (data: CreateTarefaData): Promise<{ id: number }> => {
    const { rows } = await query<{ id: number }>(
      `INSERT INTO tarefas (titulo, descricao, criador_id, responsavel_id, setor_id, prioridade, prazo)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [data.titulo, data.descricao, data.criador_id, data.responsavel_id, data.setor_id, data.prioridade, data.prazo]
    );
    return rows[0];
  },

  update: async (id: number, fields: Partial<{ titulo: string; descricao: string; responsavel_id: number; setor_id: number; prioridade: Prioridade; prazo: string }>): Promise<{ id: number } | null> => {
    const allowed = ['titulo','descricao','responsavel_id','setor_id','prioridade','prazo'] as const;
    const sets: string[] = [];
    const params: unknown[] = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = $${params.length + 1}`);
        params.push(fields[key]);
      }
    }
    if (sets.length === 0) return null;
    params.push(id);
    const { rows } = await query<{ id: number }>(
      `UPDATE tarefas SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING id`, params
    );
    return rows[0] ?? null;
  },

  updateStatus: async (id: number, status: string): Promise<{ id: number; status: string }> => {
    const concluido = status === 'CONCLUIDA' ? 'NOW()' : 'NULL';
    const { rows } = await query<{ id: number; status: string }>(
      `UPDATE tarefas SET status = $1, concluido_em = ${concluido} WHERE id = $2 RETURNING id, status`,
      [status, id]
    );
    return rows[0];
  },

  kpiByUser: async (userId: number): Promise<Record<string, string>> => {
    const { rows } = await query<Record<string, string>>(
      `SELECT
         COUNT(*) FILTER (WHERE status IN ('PENDENTE','EM_ANDAMENTO','AGUARDANDO')) AS abertas,
         COUNT(*) FILTER (WHERE prazo < NOW() AND status != 'CONCLUIDA')            AS atrasadas,
         COUNT(*) FILTER (WHERE status = 'CONCLUIDA' AND concluido_em >= NOW()-'7 days'::interval) AS concluidas_7d,
         COUNT(*) FILTER (WHERE status IN ('EM_ANDAMENTO','AGUARDANDO'))            AS em_andamento
       FROM tarefas WHERE responsavel_id = $1`, [userId]
    );
    return rows[0];
  },

  kpiBySetor: async (setorId: number): Promise<Record<string, string>> => {
    const { rows } = await query<Record<string, string>>(
      `SELECT
         COUNT(*) FILTER (WHERE t.status IN ('PENDENTE','EM_ANDAMENTO','AGUARDANDO')) AS abertas,
         COUNT(*) FILTER (WHERE t.prazo < NOW() AND t.status != 'CONCLUIDA')         AS atrasadas,
         COUNT(*) FILTER (WHERE t.status = 'CONCLUIDA' AND t.concluido_em >= NOW()-'7 days'::interval) AS concluidas_7d,
         COUNT(*) FILTER (WHERE t.status IN ('EM_ANDAMENTO','AGUARDANDO'))           AS em_andamento
       FROM tarefas t JOIN usuarios u ON u.id = t.responsavel_id
       WHERE t.setor_id = $1 AND u.cargo = 'FUNCIONARIO'`, [setorId]
    );
    return rows[0];
  },

  ensureColumns: async (): Promise<void> => {
    try {
      await query('ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS aviso_atraso_enviado BOOLEAN DEFAULT FALSE;');
    } catch (e) {
      console.warn('[TarefaRepository] Erro ao garantir coluna aviso_atraso_enviado:', e);
    }
  },

  findAtrasadasSemAviso: async (): Promise<Tarefa[]> => {
    const sql = `
      ${BASE_SELECT}
      WHERE t.status != 'CONCLUIDA'
        AND (t.aviso_atraso_enviado IS NULL OR t.aviso_atraso_enviado = FALSE)
        AND t.prazo <= NOW()
      ORDER BY t.prazo ASC
    `;
    const { rows } = await query<Tarefa>(sql);
    return rows;
  },

  marcarAvisoAtrasoEnviado: async (id: number): Promise<void> => {
    await query('UPDATE tarefas SET aviso_atraso_enviado = TRUE WHERE id = $1', [id]);
  },

  resetarAvisoAtraso: async (id: number): Promise<void> => {
    await query('UPDATE tarefas SET aviso_atraso_enviado = FALSE WHERE id = $1', [id]);
  },
};
