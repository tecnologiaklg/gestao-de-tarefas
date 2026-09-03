// services/DeadlineReminderService.ts
import { TarefaRepository } from '../repositories/TarefaRepository';
import { DiscordNotificationService } from './DiscordNotificationService';
import { SseService } from './SseService';
import { LogRepository } from '../repositories/LogRepository';

class DeadlineReminderServiceManager {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  public start(): void {
    if (this.timer) return;
    console.log('[DeadlineReminderService] Monitoramento de prazos ativo (ciclos de 30s)...');
    this.verificarPrazos().catch(e => console.error('[DeadlineReminderService] Erro inicial:', e));
    this.timer = setInterval(() => {
      this.verificarPrazos().catch(e => console.error('[DeadlineReminderService] Erro no ciclo:', e));
    }, 30_000);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async verificarPrazos(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const tarefas = await TarefaRepository.findPrestesAVencer10m();
      for (const tarefa of tarefas) {
        try {
          console.log(`[DeadlineReminderService] Aviso de 10 min para tarefa #${tarefa.id}: "${tarefa.titulo}" (Resp ID: ${tarefa.responsavel_id})`);

          // 1. Marca no banco para não repetir
          await TarefaRepository.marcarAviso10mEnviado(tarefa.id);

          // 2. Discord DM
          await DiscordNotificationService.notificarPrazo10Min(tarefa);

          // 3. SSE para tela aberta
          SseService.emitToUser(tarefa.responsavel_id, 'AVISO_PRAZO_10MIN', {
            tarefa,
            mensagem: `A tarefa "${tarefa.titulo}" vence em aproximadamente 10 minutos!`,
          });

          // 4. Log
          await LogRepository.registrar({
            usuario_id: tarefa.responsavel_id,
            tipo_evento: 'AVISO_PRAZO_10MIN',
            descricao: `Alerta de 10 min enviado para tarefa #${tarefa.id}: ${tarefa.titulo}`,
          });
        } catch (itemErr) {
          console.error(`[DeadlineReminderService] Erro ao processar tarefa #${tarefa.id}:`, itemErr);
        }
      }
    } finally {
      this.running = false;
    }
  }
}

export const DeadlineReminderService = new DeadlineReminderServiceManager();
