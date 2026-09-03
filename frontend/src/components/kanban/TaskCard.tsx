import { Tarefa } from '../../types';
import { Badge } from '../ui/Badge';

type Perspectiva = 'para_mim' | 'eu_para_mim' | 'eu_para_outros';

interface Props {
  tarefa: Tarefa;
  perspectiva?: Perspectiva;
  onClick: () => void;
  isDragging?: boolean;
}

const prioColor: Record<string, string> = {
  BAIXA:   'var(--color-baixa)',
  NORMAL:  'var(--color-normal)',
  URGENTE: 'var(--color-urgente)',
};

function checkPrestesAVencer(prazoStr: string, status: string): boolean {
  if (status === 'CONCLUIDA') return false;
  const prazo = new Date(prazoStr).getTime();
  const now = Date.now();
  const diffMs = prazo - now;
  // Entre 0 e 5 minutos restantes
  return diffMs > 0 && diffMs <= 5 * 60 * 1000;
}

function formatDate(d: string) {
  const date = new Date(d);
  const now   = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' (hoje)';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' · ' +
         date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function IconBuilding() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconIncoming() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="7" x2="17" y2="17" /><polyline points="17 7 17 17 7 17" />
    </svg>
  );
}

function IconOutgoing() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

export function TaskCard({ tarefa, perspectiva = 'para_mim', onClick, isDragging }: Props) {
  const prestesAVencer = checkPrestesAVencer(tarefa.prazo, tarefa.status);
  return (
    <div
      className={`task-card task-card-${perspectiva}${isDragging ? ' dragging' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Barra de destaque lateral estilo post-it */}
      <div className="task-card-side-accent" />

      {/* Cabeçalho do card com tag de perspectiva */}
      <div className="task-card-header">
        {perspectiva === 'eu_para_mim' ? (
          <span className="task-persp-pill persp-eu-para-mim">
            <IconUser />
            <span>Minha Tarefa</span>
          </span>
        ) : perspectiva === 'eu_para_outros' ? (
          <span className="task-persp-pill persp-eu-para-outros">
            <IconOutgoing />
            <span className="truncate">Para: {tarefa.responsavel_nome}</span>
          </span>
        ) : (
          <span className="task-persp-pill persp-para-mim">
            <IconIncoming />
            <span className="truncate">De: {tarefa.criador_nome}</span>
          </span>
        )}

        {/* Indicador de prioridade visual no topo */}
        <span
          className="task-card-prio-dot"
          style={{ background: prioColor[tarefa.prioridade] }}
          title={`Prioridade ${tarefa.prioridade}`}
        />
      </div>

      {/* Título da tarefa */}
      <div className="task-card-title">{tarefa.titulo}</div>

      {/* Metadados */}
      <div className="task-card-meta">
        <div className="task-card-meta-row">
          <IconBuilding />
          <span className="truncate">{tarefa.setor_nome}</span>
        </div>

        <div
          className={`task-card-meta-row${tarefa.atrasada ? ' task-card-meta-atrasada' : ''}`}
        >
          <IconClock />
          <span>{formatDate(tarefa.prazo)}</span>
        </div>
      </div>

      {/* Rodapé com badges */}
      <div className="task-card-badges">
        {prestesAVencer && (
          <span className="badge-prazo-urgente" title="Vence em menos de 5 minutos!">
            ⏰ 5 min restantes
          </span>
        )}
        <Badge type="prioridade" value={tarefa.prioridade} />
        {tarefa.atrasada && <Badge type="atrasada" value={true} />}
      </div>
    </div>
  );
}
