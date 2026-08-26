import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`[server] Rodando na porta ${env.PORT} (${env.NODE_ENV})`);
});
