// enums.ts — Valores fixos do sistema (§51)

export const CARGO = {
  DIRETOR:     'DIRETOR',
  GERENTE:     'GERENTE',
  COORDENADOR: 'COORDENADOR',
  FUNCIONARIO: 'FUNCIONARIO',
} as const;

export const PRIORIDADE = {
  BAIXA:  'BAIXA',
  NORMAL: 'NORMAL',
  URGENTE:'URGENTE',
} as const;

export const STATUS = {
  PENDENTE:     'PENDENTE',
  EM_ANDAMENTO: 'EM_ANDAMENTO',
  AGUARDANDO:   'AGUARDANDO',
  CONCLUIDA:    'CONCLUIDA',
} as const;

export type Cargo     = typeof CARGO[keyof typeof CARGO];
export type Prioridade = typeof PRIORIDADE[keyof typeof PRIORIDADE];
export type Status    = typeof STATUS[keyof typeof STATUS];

/** Transições de status permitidas (§18-19). */
export const TRANSICOES_PERMITIDAS: Record<Status, Status[]> = {
  PENDENTE:     ['EM_ANDAMENTO', 'AGUARDANDO'],
  EM_ANDAMENTO: ['AGUARDANDO',   'CONCLUIDA'],
  AGUARDANDO:   ['EM_ANDAMENTO', 'CONCLUIDA'],
  CONCLUIDA:    [],
};
