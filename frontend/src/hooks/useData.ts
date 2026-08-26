import { useState, useEffect } from 'react';
import { usuarioService } from '../services/usuarioService';
import { setorService }   from '../services/setorService';
import { logService }     from '../services/comentarioService';
import { comentarioService } from '../services/comentarioService';
import { Usuario, Setor, Log, Comentario, HistoricoEntry } from '../types';
import api from '../services/api';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetch = async () => {
    setLoading(true);
    try { setUsuarios(await usuarioService.listar()); } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);
  return { usuarios, loading, refetch: fetch };
}

export function useSetores() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try { setSetores(await setorService.listar()); } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);
  return { setores, loading, refetch: fetch };
}

export function useLogs(params?: { usuario_id?: number; tipo_evento?: string }) {
  const [logs, setLogs]     = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setLogs(await logService.listar(params)); } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [JSON.stringify(params)]);

  return { logs, loading };
}

export function useComentarios(tarefaId: number | null) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    if (!tarefaId) return;
    setLoading(true);
    try { setComentarios(await comentarioService.listar(tarefaId)); } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [tarefaId]);
  return { comentarios, loading, refetch: fetch };
}

export function useHistorico(tarefaId: number | null) {
  const [historico, setHistorico] = useState<HistoricoEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tarefaId) return;
    setLoading(true);
    api.get<HistoricoEntry[]>(`/tarefas/${tarefaId}/historico`)
      .then(r => setHistorico(r.data))
      .catch(() => { /* ignore */ })
      .finally(() => setLoading(false));
  }, [tarefaId]);

  return { historico, loading };
}
