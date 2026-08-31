import api from './api';

export interface SqlResult {
  rows: Record<string, unknown>[];
  rowCount: number | null;
  command: string;
  elapsed_ms: number;
}

export const sqlService = {
  exec: async (sql: string): Promise<SqlResult> => {
    const { data } = await api.post<SqlResult>('/sql/exec', { sql });
    return data;
  },
};
