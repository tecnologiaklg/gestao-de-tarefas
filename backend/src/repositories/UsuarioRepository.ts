// repositories/UsuarioRepository.ts
import { query } from '../config/database';
import { Usuario } from '../types';

export const UsuarioRepository = {
  findByPin: async (pin: string): Promise<Usuario | null> => {
    const { rows } = await query<Usuario>(
      'SELECT * FROM usuarios WHERE pin = $1 LIMIT 1', [pin]
    );
    return rows[0] ?? null;
  },

  findById: async (id: number): Promise<Usuario | null> => {
    const { rows } = await query<Usuario>(
      `SELECT u.id, u.nome, u.cargo, u.setor_id, s.nome AS setor_nome,
              u.ativo, u.discord_id, u.discord_vinculado
       FROM usuarios u LEFT JOIN setores s ON s.id = u.setor_id
       WHERE u.id = $1 LIMIT 1`, [id]
    );
    return rows[0] ?? null;
  },

  findAll: async (): Promise<Usuario[]> => {
    const { rows } = await query<Usuario>(
      `SELECT u.id, u.nome, u.cargo, u.setor_id, s.nome AS setor_nome,
              u.ativo, u.discord_vinculado
       FROM usuarios u LEFT JOIN setores s ON s.id = u.setor_id
       ORDER BY u.nome`
    );
    return rows;
  },

  findBySetor: async (setorId: number, excludeId?: number): Promise<Partial<Usuario>[]> => {
    const { rows } = await query<Partial<Usuario>>(
      `SELECT id, nome, cargo FROM usuarios
       WHERE setor_id = $1 AND ativo = TRUE AND id != $2
       ORDER BY nome`,
      [setorId, excludeId ?? 0]
    );
    return rows;
  },

  findActiveDiscordUsers: async (): Promise<Array<{ id: number; discord_id: string; nome: string }>> => {
    const { rows } = await query<{ id: number; discord_id: string; nome: string }>(
      'SELECT id, discord_id, nome FROM usuarios WHERE discord_vinculado = TRUE AND ativo = TRUE'
    );
    return rows;
  },

  create: async (data: { nome: string; pin: string; cargo: string; setor_id?: number | null }): Promise<Usuario> => {
    const { rows } = await query<Usuario>(
      'INSERT INTO usuarios (nome, pin, cargo, setor_id) VALUES ($1,$2,$3,$4) RETURNING id, nome, cargo, setor_id, ativo',
      [data.nome, data.pin, data.cargo, data.setor_id ?? null]
    );
    return rows[0];
  },

  setAtivo: async (id: number, ativo: boolean): Promise<Usuario> => {
    const { rows } = await query<Usuario>(
      'UPDATE usuarios SET ativo = $1 WHERE id = $2 RETURNING id, nome, ativo',
      [ativo, id]
    );
    return rows[0];
  },

  setDiscordVinculo: async (id: number, discordId: string): Promise<void> => {
    await query(
      'UPDATE usuarios SET discord_id = $1, discord_vinculado = TRUE WHERE id = $2',
      [discordId, id]
    );
  },

  findByDiscordId: async (discordId: string): Promise<Usuario | null> => {
    const { rows } = await query<Usuario>(
      'SELECT * FROM usuarios WHERE discord_id = $1 LIMIT 1', [discordId]
    );
    return rows[0] ?? null;
  },

  hasOpenTasks: async (id: number): Promise<boolean> => {
    const { rows } = await query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM tarefas
       WHERE responsavel_id = $1 AND status IN ('PENDENTE','EM_ANDAMENTO','AGUARDANDO')`, [id]
    );
    return parseInt(rows[0].total, 10) > 0;
  },
};
