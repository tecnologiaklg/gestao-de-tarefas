-- ============================================================
-- 001_schema.sql  — Schema completo do Portal de Tarefas
-- ============================================================

-- Enums
CREATE TYPE cargo_enum      AS ENUM ('DIRETOR','GERENTE','COORDENADOR','FUNCIONARIO');
CREATE TYPE prioridade_enum AS ENUM ('BAIXA','NORMAL','URGENTE');
CREATE TYPE status_enum     AS ENUM ('PENDENTE','EM_ANDAMENTO','AGUARDANDO','CONCLUIDA');

-- Setores
CREATE TABLE IF NOT EXISTS setores (
  id   SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE
);

-- Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id                SERIAL PRIMARY KEY,
  nome              VARCHAR(150) NOT NULL,
  pin               CHAR(6)      NOT NULL UNIQUE,
  cargo             cargo_enum   NOT NULL,
  setor_id          INT          REFERENCES setores(id),
  ativo             BOOLEAN      NOT NULL DEFAULT TRUE,
  discord_id        VARCHAR(30),
  discord_vinculado BOOLEAN      NOT NULL DEFAULT FALSE
);

-- Tarefas
CREATE TABLE IF NOT EXISTS tarefas (
  id             SERIAL PRIMARY KEY,
  titulo         VARCHAR(255)    NOT NULL,
  descricao      TEXT            NOT NULL,
  criador_id     INT             NOT NULL REFERENCES usuarios(id),
  responsavel_id INT             NOT NULL REFERENCES usuarios(id),
  setor_id       INT             NOT NULL REFERENCES setores(id),
  prioridade     prioridade_enum NOT NULL,
  status         status_enum     NOT NULL DEFAULT 'PENDENTE',
  prazo          TIMESTAMPTZ     NOT NULL,
  criado_em      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  concluido_em   TIMESTAMPTZ
);

-- Histórico das tarefas
CREATE TABLE IF NOT EXISTS historico_tarefas (
  id           SERIAL PRIMARY KEY,
  tarefa_id    INT         NOT NULL REFERENCES tarefas(id),
  usuario_id   INT         NOT NULL REFERENCES usuarios(id),
  tipo         VARCHAR(80) NOT NULL,
  valor_antes  TEXT,
  valor_depois TEXT,
  descricao    TEXT,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários
CREATE TABLE IF NOT EXISTS comentarios (
  id        SERIAL PRIMARY KEY,
  tarefa_id INT         NOT NULL REFERENCES tarefas(id),
  autor_id  INT         NOT NULL REFERENCES usuarios(id),
  conteudo  TEXT        NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Logs globais
CREATE TABLE IF NOT EXISTS logs (
  id           SERIAL PRIMARY KEY,
  usuario_id   INT         REFERENCES usuarios(id),
  tipo_evento  VARCHAR(80) NOT NULL,
  descricao    TEXT,
  valor_antes  TEXT,
  valor_depois TEXT,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
