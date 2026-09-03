// services/SseService.ts
import { Response } from 'express';

interface SseClient {
  userId: number;
  res: Response;
}

class SseServiceManager {
  private clients: Set<SseClient> = new Set();
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, 25_000);
  }

  public addClient(userId: number, res: Response): void {
    const client: SseClient = { userId, res };
    this.clients.add(client);

    res.on('close', () => {
      this.clients.delete(client);
    });

    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', userId })}\n\n`);
  }

  public emitToUser(userId: number, event: string, data: unknown): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      if (client.userId === userId) {
        try {
          client.res.write(payload);
        } catch (e) {
          console.warn(`[SseService] Erro ao enviar evento para user ${userId}:`, e);
          this.clients.delete(client);
        }
      }
    }
  }

  public emitToUsers(userIds: number[], event: string, data: unknown): void {
    const targetSet = new Set(userIds);
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      if (targetSet.has(client.userId)) {
        try {
          client.res.write(payload);
        } catch (e) {
          console.warn(`[SseService] Erro ao enviar evento para user ${client.userId}:`, e);
          this.clients.delete(client);
        }
      }
    }
  }

  public broadcast(event: string, data: unknown): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.res.write(payload);
      } catch (e) {
        console.warn('[SseService] Erro no broadcast:', e);
        this.clients.delete(client);
      }
    }
  }

  private sendHeartbeat(): void {
    for (const client of this.clients) {
      try {
        client.res.write(': heartbeat\n\n');
      } catch {
        this.clients.delete(client);
      }
    }
  }
}

export const SseService = new SseServiceManager();
