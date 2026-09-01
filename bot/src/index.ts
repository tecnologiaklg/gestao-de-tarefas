// src/index.ts — Bot Discord + mini-servidor HTTP para receber notificações do backend

import 'dotenv/config';
import {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  Message,
  REST,
  Routes,
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActivityType,
} from 'discord.js';
import express, { Request, Response } from 'express';
import axios from 'axios';
import cron from 'node-cron';

// ── Env ────────────────────────────────────────────────────────────────────────
const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
const BACKEND_URL   = process.env.BACKEND_URL ?? 'http://localhost:4000';
const BOT_PORT      = parseInt(process.env.BOT_PORT ?? '3001', 10);

if (!DISCORD_TOKEN) {
  console.error('[bot] DISCORD_TOKEN não definido no .env');
  process.exit(1);
}

// ── Anti-spam: usuário pode tentar vincular no máximo 1x a cada 30s ──────────
const cooldowns = new Map<string, number>();
const COOLDOWN_MS = 30_000;

// ── Discord Client ─────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
  ],
});

// ── Funções auxiliares ─────────────────────────────────────────────────────────

async function sendDM(discordId: string, text: string): Promise<boolean> {
  try {
    const user = await client.users.fetch(discordId);
    if (!user) {
      console.warn(`[bot] Usuário Discord ${discordId} não encontrado.`);
      return false;
    }
    await user.send(text);
    return true;
  } catch (err: unknown) {
    console.warn(`[bot] Falha ao enviar DM para ${discordId}. Verifique se o usuário tem DMs abertas. Erro:`, err);
    return false;
  }
}

async function processarVinculo(pin: string, discordId: string, replyFn: (text: string) => Promise<unknown>) {
  // Anti-spam
  const last = cooldowns.get(discordId);
  if (last && Date.now() - last < COOLDOWN_MS) {
    const restante = Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000);
    return replyFn(`⏳ Aguarde ${restante}s antes de tentar novamente.`);
  }
  cooldowns.set(discordId, Date.now());

  if (!pin || !/^\d{6}$/.test(pin)) {
    return replyFn(
      '❌ **Formato inválido!**\nUse: `/vincular <PIN>`\nExemplo: `/vincular 123456`\n_(6 dígitos numéricos fornecidos pelo administrador)_'
    );
  }

  if (pin === '000000') {
    return replyFn('❌ PIN `000000` é exclusivo do Root e não pode ser vinculado ao Discord.');
  }

  try {
    console.log(`[bot] Tentando vincular PIN ${pin} para Discord ID ${discordId}...`);
    const { data } = await axios.post(`${BACKEND_URL}/api/discord/vincular`, {
      pin,
      discord_id: discordId,
    });

    const kpi = data.kpi;
    const resumo = kpi
      ? `\n\n📊 **Seu resumo de tarefas:**\n• Abertas: **${kpi.abertas}**\n• Atrasadas: **${kpi.atrasadas}**\n• Em andamento: **${kpi.emAndamento}**\n• Concluídas (7d): **${kpi.concluidas7d}**`
      : '';

    await replyFn(
      `✅ **Conta vinculada com sucesso!**\nOlá, **${data.usuario}**! Sua conta foi vinculada ao Portal de Tarefas.\nVocê receberá notificações e códigos de login diretamente aqui.${resumo}`
    );
    console.log(`[bot] Vínculo concluído com sucesso para ${data.usuario} (${discordId})`);
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { error?: string }; status?: number } };
    const detail   = axiosErr.response?.data?.error ?? 'Não foi possível comunicar com o servidor do portal.';
    console.error('[bot] Erro ao vincular:', detail);
    await replyFn(`❌ Não foi possível vincular: **${detail}**`);
  }
}

// ── 1. Resposta a Mensagens de Texto (Exclusivo em DM Privada) ─────────────────
client.on(Events.MessageCreate, async (msg: Message) => {
  if (msg.author.bot) return;

  // Se a mensagem for em canal de servidor, ignora para não poluir os canais da empresa
  if (msg.guild !== null || !msg.channel.isDMBased()) {
    return;
  }

  const content = msg.content.trim();

  // Em mensagem privada (DM):
  // Caso A: Usuário enviou apenas o PIN de 6 dígitos direto
  if (/^\d{6}$/.test(content)) {
    await processarVinculo(content, msg.author.id, async (text) => {
      await msg.reply(text);
    });
    return;
  }

  // Caso B: Usuário enviou com prefixo /vincular, !vincular ou vincular
  if (content.startsWith('/vincular') || content.startsWith('!vincular') || content.toLowerCase().startsWith('vincular')) {
    const parts = content.split(/\s+/);
    const pin = parts[1] ?? '';
    await processarVinculo(pin, msg.author.id, async (text) => {
      await msg.reply(text);
    });
    return;
  }

  // Caso C: Qualquer outra mensagem em DM recebe orientação rápida
  await msg.reply(
    'Para vincular sua conta ao Portal de Tarefas, envie apenas o seu **PIN de 6 dígitos** aqui no chat privado.'
  );
});

// ── Cron: resumo diário às 08:00 BRT (Segunda a Sexta) ───────────────────────────
cron.schedule('0 8 * * 1-5', async () => {
  console.log('[bot-cron] Disparando resumo matinal...');
  try {
    const hojeStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'America/Sao_Paulo' }).toLowerCase();
    const isSegunda = hojeStr.includes('segunda');

    const { data: usuarios } = await axios.get<Array<{ id: number; discord_id: string; nome?: string }>>(
      `${BACKEND_URL}/api/discord/usuarios-ativos`
    );

    for (const u of usuarios) {
      try {
        const { data: kpi } = await axios.get(`${BACKEND_URL}/api/discord/resumo/${u.id}`);
        const primeiroNome = u.nome ? u.nome.split(' ')[0] : 'colaborador';

        if (isSegunda) {
          await sendDM(u.discord_id,
            `**Resumo Semanal de Tarefas — KLG**\n\n` +
            `• Abertas: **${kpi.abertas}**\n` +
            `• Em andamento: **${kpi.emAndamento}**\n` +
            `• Atrasadas: **${kpi.atrasadas}**\n` +
            `• Concluídas nos últimos 7 dias: **${kpi.concluidas7d}**\n\n` +
            `Acesse o portal: https://tarefas.klgdobrasil.com.br`
          );
        } else {
          await sendDM(u.discord_id,
            `**Resumo de Tarefas — ${primeiroNome}**\n\n` +
            `• Abertas: **${kpi.abertas}**\n` +
            `• Em andamento: **${kpi.emAndamento}**\n` +
            `• Atrasadas: **${kpi.atrasadas}**\n` +
            `• Concluídas (7d): **${kpi.concluidas7d}**`
          );
        }
      } catch (userErr) {
        console.warn(`[bot-cron] Falha ao enviar resumo para ${u.nome ?? u.id} (${u.discord_id}):`, userErr);
      }
    }
  } catch (err) {
    console.error('[bot-cron] Erro ao buscar usuários ativos:', err);
  }
}, { timezone: 'America/Sao_Paulo' });

// ── Servidor HTTP interno (recebe notificações do backend) ─────────────────────
const app = express();
app.use(express.json());

/** POST /notify — Backend chama para enviar DMs de notificação */
app.post('/notify', async (req: Request, res: Response) => {
  const { discord_id, mensagem } = req.body as { discord_id?: string; mensagem?: string };
  if (!discord_id || !mensagem) {
    res.status(400).json({ error: 'discord_id e mensagem são obrigatórios' });
    return;
  }
  const sent = await sendDM(discord_id, mensagem);
  res.json({ ok: sent });
});

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok', bot: client.user?.tag }));

// ── Boot ───────────────────────────────────────────────────────────────────────
client.once(Events.ClientReady, async () => {
  console.log(`[bot] Conectado ao Discord com sucesso como: ${client.user?.tag} (ID: ${client.user?.id})`);

  if (client.user) {
    // Define status como Online e atividade personalizada
    client.user.setPresence({
      status: 'online',
      activities: [{ name: 'Portal de Tarefas 📋', type: ActivityType.Watching }],
    });
  }
  app.listen(BOT_PORT, () => console.log(`[bot-http] Servidor de notificações ouvindo na porta ${BOT_PORT}`));
});

client.login(DISCORD_TOKEN).catch(err => {
  console.error('[bot] Erro ao autenticar no Discord. Verifique o DISCORD_TOKEN:', err);
});
