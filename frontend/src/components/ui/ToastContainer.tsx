// components/ui/ToastContainer.tsx
import { useNotification, ToastNotification } from '../../contexts/NotificationContext';

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastNotification; onRemove: () => void }) {
  const isAvisoPrazo = toast.type === 'aviso_prazo_10m' || toast.type === 'aviso_atraso';

  return (
    <div className={`toast-card ${isAvisoPrazo ? 'toast-aviso-prazo' : 'toast-nova-tarefa'}`}>
      <div className="toast-icon">
        {isAvisoPrazo ? <IconClock /> : <IconCheck />}
      </div>
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        <div className="toast-message">{toast.message}</div>
        {toast.tarefa?.prazo && (
          <div className="toast-sub">
            Prazo: {new Date(toast.tarefa.prazo).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
      <button className="toast-close-btn" onClick={onRemove} title="Fechar aviso">
        <IconClose />
      </button>
      <div className="toast-progress-bar" />
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}
