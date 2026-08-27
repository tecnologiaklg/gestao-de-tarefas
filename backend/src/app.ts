import 'dotenv/config';
import './config/env'; // valida variáveis no boot

import express, { Request, Response, NextFunction } from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import routes       from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { UsuarioRepository } from './repositories/UsuarioRepository';
import { LogRepository }     from './repositories/LogRepository';
import { KpiService }        from './services/KpiService';
import { UnauthorizedError, NotFoundError } from './errors/AppError';

const app = express();

app.use(helmet());
app.use(cors());
app.use(requestLogger);
app.use(express.json());

// Healthcheck
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// API Routes
app.use('/api', routes);

// ── Endpoints internos para o Bot Discord ──────────────────────────────────

/** POST /api/discord/vincular — chamado pelo bot após o usuário digitar o PIN */
app.post('/api/discord/vincular', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pin, discord_id } = req.body as { pin?: string; discord_id?: string };
    if (!pin || !discord_id) throw new UnauthorizedError('pin e discord_id são obrigatórios');
    if (pin === '000000') throw new UnauthorizedError('Root não pode vincular Discord');

    const usuario = await UsuarioRepository.findByPin(pin);
    if (!usuario) throw new NotFoundError('Usuário não encontrado com este PIN');

    await UsuarioRepository.setDiscordVinculo(usuario.id, discord_id);
    await LogRepository.registrar({
      usuario_id:  usuario.id,
      tipo_evento: 'DISCORD_VINCULO',
      descricao:   `Discord vinculado: ${discord_id}`,
    });

    // Resumo imediato após vínculo (§43)
    const kpi = await KpiService.kpiUsuario(usuario.id);
    res.json({ mensagem: 'Discord vinculado com sucesso', usuario: usuario.nome, kpi });
  } catch (err) { next(err); }
});

/** GET /api/discord/usuarios-ativos — lista usuários com Discord vinculado (para cron do bot) */
app.get('/api/discord/usuarios-ativos', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const usuarios = await UsuarioRepository.findActiveDiscordUsers();
    res.json(usuarios);
  } catch (err) { next(err); }
});

/** GET /api/discord/resumo/:userId — chamado pelo cron do bot */
app.get('/api/discord/resumo/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const kpi = await KpiService.kpiUsuario(parseInt(req.params.userId as string, 10));
    res.json(kpi);
  } catch (err) { next(err); }
});

// Error handler (deve ser o último middleware)
app.use(errorHandler);

export default app;
