// src/index.ts — Bot Discord + mini-servidor HTTP para receber notificações do backend

import {
  Client, GatewayIntentBits, Events, Message, TextChannel
} from 'discord.js';
import express, { Request, Response } from 'express';
import axios from 'axios';
import cron from 'node-cron';

// ── Env ────────────────────────────────────────────────────────────────────────
const DISCORD_TOKEN  = process.env.DISCORD_TOKEN!;
const BACKEND_URL    = process.env.BACKEND_URL ?? 'http://backend:4000';
const BOT_PORT       = parseInt(process.env.BOT_PORT ?? '3001', 10);

if (!DISCORD_TOKEN) { console.error('[bot] DISCORD_TOKEN não definido'); process.exit(1); }

// ── Anti-spam: usuário pode enviar /vincular no máximo 1x a cada 60s ──────────
const cooldowns = new Map<string, number>();
const COOLDOWN_MS = 60_000;

// ── Discord Client ─────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ── Funções auxiliares ─────────────────────────────────────────────────────────

async function sendDM(discordId: string, text: string): Promise<void> {
  try {
    const user = await client.users.fetch(discordId);
    await user.send(text);
  } catch (err) {
    console.warn(`[bot] Falha ao enviar DM para ${discordId}:`, err);
  }
}

// ── Comando /vincular via DM ───────────────────────────────────────────────────
client.on(Events.MessageCreate, async (msg: Message) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith('/vincular')) return;
  if (!msg.channel.isDMBased()) return; // apenas DMs

  const discordId = msg.author.id;

  // Anti-spam
  const last = cooldowns.get(discordId);
  if (last && Date.now() - last < COOLDOWN_MS) {
    const restante = Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000);
    return void msg.reply(`⏳ Aguarde ${restante}s antes de tentar novamente.`);
  }
  cooldowns.set(discordId, Date.now());

  const parts = msg.content.trim().split(/\s+/);
  const pin   = parts[1];

  if (!pin || !/^\d{6}$/.test(pin)) {
    return void msg.reply(
      '❌ Uso correto: `/vincular <PIN>`\nExemplo: `/vincular 123456`\n_(6 dígitos numéricos)_'
    );
  }

  if (pin === '000000') {
    return void msg.reply('❌ PIN inválido.');
  }

  try {
    const { data } = await axios.post(`${BACKEND_URL}/api/discord/vincular`, {
      pin, discord_id: discordId,
    });

    const kpi = data.kpi;
    const resumo = kpi
      ? `\n📊 **Seu resumo atual:**\n• Abertas: ${kpi.abertas}\n• Atrasadas: ${kpi.atrasadas}\n• Em andamento: ${kpi.emAndamento}\n• Concluídas (7d): ${kpi.concluidas7d}`
      : '';

    await msg.reply(
      `✅ **Vínculo criado com sucesso!**\nBem-vindo, **${data.usuario}**!\nVocê receberá notificações aqui no Discord sobre suas tarefas.${resumo}`
    );
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { error?: string }; status?: number } };
    const detail   = axiosErr.response?.data?.error ?? 'Erro desconhecido';
    console.error('[bot] Erro ao vincular:', detail);
    await msg.reply(`❌ Não foi possível vincular: **${detail}**`);
  }
});

// ── Cron: resumo diário às 08:00 BRT ─────────────────────────────────────────
cron.schedule('0 8 * * *', async () => {
  console.log('[bot-cron] Disparando resumo diário...');
  try {
    // Busca usuários com Discord vinculado
    const { data: usuarios } = await axios.get<Array<{ id: number; discord_id: string }>>(
      `${BACKEND_URL}/api/discord/usuarios-ativos`
    );
    for (const u of usuarios) {
      try {
        const { data: kpi } = await axios.get(`${BACKEND_URL}/api/discord/resumo/${u.id}`);
        if (kpi.abertas === 0 && kpi.atrasadas === 0) continue; // nada a reportar
        await sendDM(u.discord_id,
          `📋 **Bom dia! Seu resumo de tarefas:**\n` +
          `• 📌 Abertas: **${kpi.abertas}**\n` +
          `• ⚠️ Atrasadas: **${kpi.atrasadas}**\n` +
          `• ⚡ Em andamento: **${kpi.emAndamento}**\n` +
          `• ✅ Concluídas (7d): **${kpi.concluidas7d}**`
        );
      } catch { /* ignora falha individual */ }
    }
  } catch (err) {
    console.error('[bot-cron] Erro ao buscar usuários:', err);
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
  await sendDM(discord_id, mensagem);
  res.json({ ok: true });
});

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

// ── Boot ───────────────────────────────────────────────────────────────────────
client.once(Events.ClientReady, () => {
  console.log(`[bot] Conectado como: ${client.user?.tag}`);
  app.listen(BOT_PORT, () => console.log(`[bot-http] Servidor na porta ${BOT_PORT}`));
});

client.login(DISCORD_TOKEN);
