import app from './app';
import { env } from './config/env';
import { UsuarioRepository } from './repositories/UsuarioRepository';

UsuarioRepository.ensureColumns().catch(e => console.warn('[server] Falha ao verificar colunas:', e));

app.listen(env.PORT, () => {
  console.log(`[server] Rodando na porta ${env.PORT} (${env.NODE_ENV}) - Banco conectado`);
});
