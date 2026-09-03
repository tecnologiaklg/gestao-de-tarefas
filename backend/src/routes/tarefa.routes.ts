import { Router, Request, Response } from 'express';
import { TarefaController } from '../controllers/TarefaController';
import { ComentarioController } from '../controllers/ComentarioController';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkNotRoot, checkCoordenador } from '../middleware/role.middleware';
import { HistoricoRepository } from '../repositories/HistoricoRepository';
import { TarefaRepository } from '../repositories/TarefaRepository';
import { DiscordNotificationService } from '../services/DiscordNotificationService';
import { UsuarioRepository } from '../repositories/UsuarioRepository';

const router = Router();
router.use(authMiddleware);

// DELETE bloqueado em qualquer rota de tarefa (§27, §54)
router.use((req: Request, res: Response, next) => {
  if (req.method === 'DELETE') {
    return res.status(405).json({ error: 'Exclusão de tarefas não é permitida' });
  }
  next();
});

router.get('/todas',          checkNotRoot, TarefaController.todas);
router.get('/minhas',         checkNotRoot, TarefaController.minhas);
router.get('/criadas',        checkNotRoot, TarefaController.criadas);
router.get('/equipe',         checkNotRoot, checkCoordenador, TarefaController.equipe);
router.get('/:id',            TarefaController.buscar);
router.post('/',              checkNotRoot, TarefaController.criar);
router.patch('/:id',          checkNotRoot, TarefaController.atualizar);
router.patch('/:id/status',   checkNotRoot, TarefaController.alterarStatus);

router.get('/:tarefaId/comentarios',   ComentarioController.listar);
router.post('/:tarefaId/comentarios',  checkNotRoot, ComentarioController.criar);
router.get('/:id/historico', async (req, res, next) => {
  try {
    res.json(await HistoricoRepository.findByTarefa(parseInt(req.params.id)));
  } catch(e) {
    next(e);
  }
});

// POST /:id/reclamar — Botão de reclamação por atraso (+15 min, disparado UMA única vez)
router.post('/:id/reclamar', checkNotRoot, async (req, res, next) => {
  try {
    const u = req.user as { id: number; nome: string };
    const tarefaId = parseInt(req.params.id as string, 10);
    const tarefa = await TarefaRepository.findById(tarefaId);
    if (!tarefa) { res.status(404).json({ error: 'Tarefa não encontrada' }); return; }
    if (tarefa.responsavel_id !== u.id && tarefa.criador_id !== u.id) {
      res.status(403).json({ error: 'Você não tem permissão para cobrar esta tarefa' });
      return;
    }
    if (!tarefa.atrasada) { res.status(422).json({ error: 'Tarefa não está atrasada' }); return; }

    const atrasoMs = Date.now() - new Date(tarefa.prazo).getTime();
    if (atrasoMs < 15 * 60 * 1000) {
      res.status(422).json({ error: 'A tarefa precisa estar atrasada há pelo menos 15 minutos' });
      return;
    }

    if (tarefa.reclamacao_enviada) {
      res.status(422).json({ error: 'Lembrete de atraso já foi enviado anteriormente para esta tarefa' });
      return;
    }

    await TarefaRepository.marcarReclamacaoEnviada(tarefaId);

    const atrasoMin = Math.floor(atrasoMs / 60000);
    const usuario = await UsuarioRepository.findById(u.id);
    const nomeAutor = usuario?.nome ?? u.nome ?? 'Colaborador';

    // Registra comentário de cobrança na tarefa
    const comentarioTexto = `🚨 [Cobrança de Atraso] Tarefa atrasada há ${atrasoMin} minutos cobrada por ${nomeAutor}.`;
    await HistoricoRepository.registrar({
      tarefa_id: tarefaId,
      usuario_id: u.id,
      tipo: 'COMENTARIO',
      descricao: comentarioTexto,
    });
    await LogRepository.registrar({
      usuario_id: u.id,
      tipo_evento: 'COBRANCA_ATRASO_15M',
      descricao: `Cobrança de atraso enviada na tarefa #${tarefaId}`,
    });

    // Envia no Discord para a outra parte envolvida
    const destinatarioId = u.id === tarefa.criador_id ? tarefa.responsavel_id : tarefa.criador_id;
    await DiscordNotificationService.notificarReclamacao(tarefa, { nome: nomeAutor }, destinatarioId);

    res.json({ ok: true, mensagem: 'Lembrete de atraso registrado e enviado com sucesso!' });
  } catch (e) { next(e); }
});

export default router;
