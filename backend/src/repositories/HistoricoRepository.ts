// repositories/HistoricoRepository.ts
import { query } from '../config/database';
import { HistoricoEntry } from '../types';

export interface RegistrarHistoricoData {
  tarefa_id: number;
  usuario_id: number;
  tipo: string;
  valor_antes?: string | null;
  valor_depois?: string | null;
  descricao?: string | null;
}

export const HistoricoRepository = {
  registrar: async (data: RegistrarHistoricoData): Promise<void> => {
    await query(
      `INSERT INTO historico_tarefas (tarefa_id, usuario_id, tipo, valor_antes, valor_depois, descricao)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [data.tarefa_id, data.usuario_id, data.tipo, data.valor_antes ?? null, data.valor_depois ?? null, data.descricao ?? null]
    );
  },

  findByTarefa: async (tarefaId: number): Promise<HistoricoEntry[]> => {
    const { rows } = await query<HistoricoEntry>(
      `SELECT h.*, u.nome AS autor_nome
       FROM historico_tarefas h JOIN usuarios u ON u.id = h.usuario_id
       WHERE h.tarefa_id = $1 ORDER BY h.criado_em ASC`, [tarefaId]
    );
    return rows;
  },
};
