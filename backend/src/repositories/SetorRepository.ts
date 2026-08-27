// repositories/SetorRepository.ts
import { query } from '../config/database';
import { Setor } from '../types';

export const SetorRepository = {
  findAll: async (): Promise<Setor[]> => {
    const { rows } = await query<Setor>(
      `SELECT s.id, s.nome,
              COUNT(u.id)::int AS total_membros,
              JSON_AGG(
                CASE WHEN u.cargo = 'COORDENADOR'
                THEN JSON_BUILD_OBJECT('id', u.id, 'nome', u.nome)
                END
              ) FILTER (WHERE u.cargo = 'COORDENADOR') AS coordenadores
       FROM setores s
       LEFT JOIN usuarios u ON u.setor_id = s.id AND u.ativo = TRUE
       GROUP BY s.id, s.nome
       ORDER BY s.nome`
    );
    return rows;
  },

  findById: async (id: number): Promise<Setor | null> => {
    const { rows } = await query<Setor>('SELECT * FROM setores WHERE id = $1 LIMIT 1', [id]);
    return rows[0] ?? null;
  },

  findByNome: async (nome: string): Promise<Setor | null> => {
    const { rows } = await query<Setor>(
      'SELECT * FROM setores WHERE LOWER(nome) = LOWER($1) LIMIT 1', [nome]
    );
    return rows[0] ?? null;
  },

  create: async (nome: string): Promise<Setor> => {
    const { rows } = await query<Setor>('INSERT INTO setores (nome) VALUES ($1) RETURNING *', [nome]);
    return rows[0];
  },

  update: async (id: number, nome: string): Promise<Setor> => {
    const { rows } = await query<Setor>(
      'UPDATE setores SET nome = $1 WHERE id = $2 RETURNING *', [nome, id]
    );
    return rows[0];
  },
};
