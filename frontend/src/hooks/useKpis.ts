import { useState, useEffect } from 'react';
import { kpiService } from '../services/kpiService';
import { KpiData } from '../types';

export function useKpis(mode: 'usuario' | 'equipe' = 'usuario') {
  const [kpis, setKpis] = useState<KpiData>({ abertas: 0, atrasadas: 0, concluidas7d: 0, emAndamento: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = mode === 'equipe' ? await kpiService.equipe() : await kpiService.usuario();
        setKpis(data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [mode]);

  return { kpis, loading };
}
