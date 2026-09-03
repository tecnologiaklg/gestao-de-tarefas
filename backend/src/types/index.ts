// types/index.ts — Interfaces e tipos compartilhados

import { Cargo, Prioridade, Status } from '../models/enums';

export interface Usuario {
  id: number;
  nome: string;
  pin?: string;
  cargo: Cargo;
  setor_id: number | null;
  setor_nome?: string;
  ativo: boolean;
  discord_id?: string | null;
  discord_vinculado: boolean;
  ultimo_login_discord?: Date | string | null;
}

export interface Setor {
  id: number;
  nome: string;
  total_membros?: number;
  coordenadores?: Array<{ id: number; nome: string }>;
}

export interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  criador_id: number;
  criador_nome: string;
  responsavel_id: number;
  responsavel_nome: string;
  responsavel_cargo: Cargo;
  setor_id: number;
  setor_nome: string;
  prioridade: Prioridade;
  status: Status;
  prazo: string;
  criado_em: string;
  concluido_em: string | null;
  atrasada: boolean;
  aviso_10m_enviado?: boolean;
  reclamacao_enviada?: boolean;
}

export interface HistoricoEntry {
  id: number;
  tarefa_id: number;
  usuario_id: number;
  autor_nome: string;
  tipo: string;
  valor_antes: string | null;
  valor_depois: string | null;
  descricao: string | null;
  criado_em: string;
}

export interface Comentario {
  id: number;
  tarefa_id: number;
  autor_id: number;
  autor_nome: string;
  conteudo: string;
  criado_em: string;
}

export interface Log {
  id: number;
  usuario_id: number | null;
  usuario_nome: string | null;
  tipo_evento: string;
  descricao: string | null;
  valor_antes: string | null;
  valor_depois: string | null;
  criado_em: string;
}

export interface KpiData {
  abertas: number;
  atrasadas: number;
  concluidas7d: number;
  emAndamento: number;
}

/** Payload do JWT (usuário normal) */
export interface JWTPayloadUser {
  id: number;
  nome: string;
  cargo: Cargo;
  setor_id: number | null;
}

/** Payload do JWT (root) */
export interface JWTPayloadRoot {
  role: 'ROOT';
}

export type JWTPayload = JWTPayloadUser | JWTPayloadRoot;

/** Express request com user injetado */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: JWTPayload;
    }
  }
}
