-- ============================================================
-- 002_seed.sql  — Dados iniciais obrigatórios
-- ============================================================

-- Setores obrigatórios (sem coordenadores/funcionários inicialmente)
INSERT INTO setores (nome) VALUES ('Direção')  ON CONFLICT (nome) DO NOTHING;
INSERT INTO setores (nome) VALUES ('Gerência') ON CONFLICT (nome) DO NOTHING;
