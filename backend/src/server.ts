import app from './app';
import { env } from './config/env';
import { UsuarioRepository } from './repositories/UsuarioRepository';
import { TarefaRepository } from './repositories/TarefaRepository';
import { DeadlineReminderService } from './services/DeadlineReminderService';

// Garante migrações de colunas automáticas
UsuarioRepository.ensureColumns().catch(e => console.warn('[server] Falha ao verificar colunas usuario:', e));
TarefaRepository.ensureColumns().catch(e => console.warn('[server] Falha ao verificar colunas tarefa:', e));

// Inicia monitoramento de prazos (10 minutos antes)
DeadlineReminderService.start();

app.listen(env.PORT, () => {
  console.log(`[server] Rodando na porta ${env.PORT} (${env.NODE_ENV}) - Banco conectado`);
});
