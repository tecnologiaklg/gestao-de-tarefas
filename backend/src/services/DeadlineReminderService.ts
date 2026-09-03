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
    console.log('[DeadlineReminderService] Monitoramento de tarefas atrasadas ativo (ciclos de 30s)...');
    this.verificarAtrasos().catch(e => console.error('[DeadlineReminderService] Erro inicial:', e));
    this.timer = setInterval(() => {
      this.verificarAtrasos().catch(e => console.error('[DeadlineReminderService] Erro no ciclo:', e));
    }, 30_000);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async verificarAtrasos(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      const tarefas = await TarefaRepository.findAtrasadasSemAviso();
      for (const tarefa of tarefas) {
        try {
          console.log(`[DeadlineReminderService] Disparando aviso de tarefa atrasada #${tarefa.id}: "${tarefa.titulo}" (Resp ID: ${tarefa.responsavel_id})`);
          
          // 1. Marca no banco para evitar disparos duplicados
          await TarefaRepository.marcarAvisoAtrasoEnviado(tarefa.id);

          // 2. Dispara no Discord na hora que atrasou
          await DiscordNotificationService.notificarAtraso(tarefa);

          // 3. Dispara na tela do usuário via SSE na hora que atrasou
          SseService.emitToUser(tarefa.responsavel_id, 'TAREFA_ATRASADA', {
            tarefa,
            mensagem: `A tarefa "${tarefa.titulo}" acaba de ultrapassar o horário limite de entrega!`,
          });

          // 4. Registra no log
          await LogRepository.registrar({
            usuario_id: tarefa.responsavel_id,
            tipo_evento: 'AVISO_TAREFA_ATRASADA',
            descricao: `Alerta de atraso enviado para tarefa #${tarefa.id}: ${tarefa.titulo}`,
          });
        } catch (itemErr) {
          console.error(`[DeadlineReminderService] Erro ao processar tarefa atrasada #${tarefa.id}:`, itemErr);
        }
      }
    } finally {
      this.running = false;
    }
  }
}

export const DeadlineReminderService = new DeadlineReminderServiceManager();
