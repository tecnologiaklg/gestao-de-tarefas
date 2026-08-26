// repositories/ComentarioRepository.ts
import { query } from '../config/database';
import { Comentario } from '../types';

export const ComentarioRepository = {
  create: async (data: { tarefa_id: number; autor_id: number; conteudo: string }): Promise<Comentario> => {
    const { rows } = await query<Comentario>(
      `INSERT INTO comentarios (tarefa_id, autor_id, conteudo) VALUES ($1,$2,$3)
       RETURNING id, tarefa_id, autor_id, conteudo, criado_em`,
      [data.tarefa_id, data.autor_id, data.conteudo]
    );
    return rows[0];
  },

  findByTarefa: async (tarefaId: number): Promise<Comentario[]> => {
    const { rows } = await query<Comentario>(
      `SELECT c.*, u.nome AS autor_nome FROM comentarios c
       JOIN usuarios u ON u.id = c.autor_id
       WHERE c.tarefa_id = $1 ORDER BY c.criado_em ASC`, [tarefaId]
    );
    return rows;
  },
};
