import { Prioridade, Status } from '../../types';

interface BadgeProps {
  type: 'prioridade' | 'status' | 'atrasada';
  value: Prioridade | Status | boolean;
}

const labelMap: Record<string, string> = {
  BAIXA: 'Baixa', NORMAL: 'Normal', URGENTE: 'Urgente',
  PENDENTE: 'Pendente', EM_ANDAMENTO: 'Em Andamento', AGUARDANDO: 'Aguardando', CONCLUIDA: 'Concluída',
};

const classMap: Record<string, string> = {
  BAIXA: 'badge badge-baixa', NORMAL: 'badge badge-normal', URGENTE: 'badge badge-urgente',
  PENDENTE: 'badge badge-pendente', EM_ANDAMENTO: 'badge badge-andamento',
  AGUARDANDO: 'badge badge-aguardando', CONCLUIDA: 'badge badge-concluida',
};

export function Badge({ type, value }: BadgeProps) {
  if (type === 'atrasada') {
    return value ? <span className="badge badge-atrasada">Atrasada</span> : null;
  }
  const key = String(value);
  return <span className={classMap[key] ?? 'badge'}>{labelMap[key] ?? key}</span>;
}
