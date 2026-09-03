// contexts/NotificationContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Tarefa } from '../types';

export interface ToastNotification {
  id: string;
  type: 'tarefa_criada' | 'aviso_atraso' | 'info';
  title: string;
  message: string;
  tarefa?: Tarefa;
  createdAt: number;
}

interface NotificationCtx {
  toasts: ToastNotification[];
  removeToast: (id: string) => void;
  requestPermission: () => Promise<void>;
  hasBrowserPermission: boolean;
}

const NotificationContext = createContext<NotificationCtx | null>(null);

function playAudioAlert(type: 'chime' | 'warning') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'chime') {
      // Duas notas suaves D5 -> A5 (som amigável de nova tarefa)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } else {
      // Alerta de 5 minutos: sequência de atenção E5 -> G5
      const freqs = [659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.14;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.4);
      });
    }
  } catch (e) {
    console.warn('[NotificationContext] Erro ao tocar áudio:', e);
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [hasBrowserPermission, setHasBrowserPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission === 'granted' : false
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id' | 'createdAt'>) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newToast: ToastNotification = { ...toast, id, createdAt: Date.now() };

    setToasts(prev => [newToast, ...prev.slice(0, 4)]); // Mantém no máximo 5 simultâneos

    // Auto dismiss em 8 segundos
    setTimeout(() => {
      removeToast(id);
    }, 8000);
  }, [removeToast]);

  const requestPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setHasBrowserPermission(perm === 'granted');
      } catch { /* ignore */ }
    }
  }, []);

  // Conexão SSE em tempo real
  useEffect(() => {
    if (!token || !user) return;

    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      // Conecta ao endpoint SSE passando o token
      const url = `/api/events?token=${encodeURIComponent(token)}`;
      eventSource = new EventSource(url);

      eventSource.addEventListener('connected', () => {
        console.log('[SSE] Conectado ao servidor de eventos em tempo real.');
      });

      // 1. Nova Tarefa Atribuída
      eventSource.addEventListener('TAREFA_CRIADA', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data) as { tarefa: Tarefa; mensagem?: string };
          const tarefa = data.tarefa;
          const uid = user.id != null ? Number(user.id) : null;

          // Se a tarefa foi criada para o usuário logado
          if (uid !== null && Number(tarefa.responsavel_id) === uid) {
            playAudioAlert('chime');
            addToast({
              type: 'tarefa_criada',
              title: '📋 Nova tarefa atribuída a você!',
              message: `"${tarefa.titulo}" de ${tarefa.criador_nome}`,
              tarefa,
            });

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('📋 Nova Tarefa Atribuída!', {
                body: `"${tarefa.titulo}" enviada por ${tarefa.criador_nome}`,
                icon: '/logoklg.png',
              });
            }
          }

          // Dispara evento global para o TarefasPage atualizar o Kanban na hora
          window.dispatchEvent(new CustomEvent('tarefa_alterada', { detail: { type: 'CRIADA', tarefa } }));
        } catch (err) {
          console.error('[SSE] Erro ao processar TAREFA_CRIADA:', err);
        }
      });

      // 2. Alerta de 5 minutos do prazo
      eventSource.addEventListener('TAREFA_ATRASADA', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data) as { tarefa: Tarefa; mensagem?: string };
          const tarefa = data.tarefa;
          const uid = user.id != null ? Number(user.id) : null;

          if (uid !== null && Number(tarefa.responsavel_id) === uid) {
            playAudioAlert('warning');
            addToast({
              type: 'aviso_atraso',
              title: '⚠️ Atenção: Tarefa Atrasada!',
              message: `A tarefa "${tarefa.titulo}" acabou de ultrapassar o horário limite!`,
              tarefa,
            });

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('⚠️ Tarefa Atrasada!', {
                body: `A tarefa "${tarefa.titulo}" ultrapassou o horário de entrega!`,
                icon: '/logoklg.png',
              });
            }
          }

          window.dispatchEvent(new CustomEvent('tarefa_alterada', { detail: { type: 'ATRASADA', tarefa } }));
        } catch (err) {
          console.error('[SSE] Erro ao processar TAREFA_ATRASADA:', err);
        }
      });


      // 3. Atualizações e mudanças de status
      eventSource.addEventListener('TAREFA_ATUALIZADA', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data) as { tarefa: Tarefa };
          window.dispatchEvent(new CustomEvent('tarefa_alterada', { detail: { type: 'ATUALIZADA', tarefa: data.tarefa } }));
        } catch (err) {
          console.error('[SSE] Erro ao processar TAREFA_ATUALIZADA:', err);
        }
      });

      eventSource.addEventListener('TAREFA_STATUS_ALTERADO', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data) as { tarefa: Tarefa };
          window.dispatchEvent(new CustomEvent('tarefa_alterada', { detail: { type: 'STATUS', tarefa: data.tarefa } }));
        } catch (err) {
          console.error('[SSE] Erro ao processar TAREFA_STATUS_ALTERADO:', err);
        }
      });

      eventSource.onerror = () => {
        console.warn('[SSE] Conexão encerrada ou erro de rede. Reconectando em 5s...');
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      };
    };

    connect();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [token, user, addToast]);

  return (
    <NotificationContext.Provider value={{ toasts, removeToast, requestPermission, hasBrowserPermission }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationCtx {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  return ctx;
}
