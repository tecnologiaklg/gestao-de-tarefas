import { useState, useEffect, useCallback } from 'react';
import { tarefaService } from '../services/tarefaService';
import { Tarefa } from '../types';

export function useTarefas(mode: 'minhas' | 'criadas' | 'equipe', params?: Record<string, string>) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = mode === 'minhas'  ? await tarefaService.minhas(params)
                 : mode === 'criadas' ? await tarefaService.criadas(params)
                 :                      await tarefaService.equipe(params);
      setTarefas(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [mode, JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { tarefas, setTarefas, loading, error, refetch: fetch };
}
