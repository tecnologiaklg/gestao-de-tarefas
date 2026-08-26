# Portal Interno de Tarefas — Plano de Implementação Completo

## Objetivo (§1)

Sistema interno para controle de tarefas entre colaboradores. Qualquer usuário ativo pode criar tarefas para outro usuário independente de cargo ou setor. O acompanhamento é feito principalmente via quadro **Kanban**.

---

## Princípio Arquitetural

> **Responsabilidade única por camada. Nenhuma camada faz o trabalho da outra.**
> O React nunca é a fonte de verdade para permissões e regras de negócio (§52).
> Toda operação segue: `React → Node.js → validação → PostgreSQL → histórico/log → Discord` (§53).

---

## Stack Tecnológica (§2)

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| Frontend | React (Vite) | Interface, Kanban, cards, filtros, KPIs, formulários, pop-ups, sidebar de detalhes |
| Backend | Node.js / Express | Autenticação, regras de negócio, permissões, CRUD, movimentação, KPIs, logs, histórico, Discord |
| Banco | PostgreSQL | Persistência de usuários, setores, tarefas, histórico, comentários, logs, Discord |
| Bot | Discord.js | Notificações, vinculação, resumo diário |
| Infra | Docker | 4 containers: frontend, backend, PostgreSQL, bot Discord |

---

## Design — Tema Claro Desktop-First

- **Tema:** claro, fundo branco/cinza-50, cards com sombra sutil
- **Paleta:** acentos azul-índigo (`#4F6AF5`), tons neutros Slate para texto, verde para concluído, âmbar para urgente/atrasado, vermelho para erro
- **Tipografia:** **Inter** (Google Fonts), escala bem definida
- **Layout:** sidebar de navegação fixa à esquerda (~240px) + área de conteúdo que ocupa todo o restante da tela; máximo aproveitamento horizontal em desktop
- **Kanban:** colunas side-by-side que preenchem 100% da altura útil; cards compactos mas informativos
- **KPI Cards:** linha de 4 cards no topo da área de conteúdo, distribuídos uniformemente
- **Sidebar de detalhes:** slide-in pela direita (~420px), sobrepõe o conteúdo principal sem redirecionar
- **Micro-animações:** hover em cards, transição do slide-in, drag-and-drop visual

---

## Decisões Definidas

| # | Questão | Decisão |
|---|---|---|
| 1 | Validade da sessão JWT | **12 horas** |
| 2 | Ambiente de deploy | **Servidor** (não local) |
| 3 | Discord — canal de envio | **DM direto ao usuário** |
| 4 | Timezone do cron 08:00 | **`America/Sao_Paulo`** ✔ |
| 5 | Seed inicial | **Somente root** — setores e usuários são cadastrados pelo root via sistema |
| 6 | Logotipo/cores da empresa | A definir — seguiremos com identidade visual própria |

> [!IMPORTANT]
> **Cadastro de setores:** O root poderá criar novos setores diretamente pela tela **Equipes**. A tela exibirá os cards dos setores existentes e um botão **+ Novo Setor** para cadastro. Setores `Direção` e `Gerência` são criados no seed inicial (§10).

---

## Arquitetura Client–Server

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT (React + Vite) — :3000                          │
│  Pages → Hooks → Services (API Client) → axios          │
└────────────────────────┬────────────────────────────────┘
                         │  HTTP/REST  Authorization: Bearer <JWT>
┌────────────────────────▼────────────────────────────────┐
│  SERVER (Node.js/Express) — :4000   MVC em camadas      │
│  Routes → Middlewares → Controllers → Services          │
│                                   → Repositories        │
│                                   → Models/Enums        │
└──────────────┬──────────────┬──────────────────────────┘
               │              │
          PostgreSQL    Discord Bot (:interno)
          :5432         Commands → Handlers → Services
                        → backendClient (axios) → Cron
```

---

## Estrutura de Pastas

### Backend

```
backend/src/
├── config/
│   ├── database.js          # Pool pg
│   ├── env.js               # Valida variáveis no boot
│   └── logger.js            # winston/pino
├── models/
│   ├── enums.js             # CARGO, PRIORIDADE, STATUS (valores fixos §51)
│   ├── Usuario.js
│   ├── Tarefa.js
│   ├── Comentario.js
│   └── Log.js
├── repositories/            # SQL puro — sem lógica de negócio
│   ├── UsuarioRepository.js
│   ├── SetorRepository.js
│   ├── TarefaRepository.js
│   ├── HistoricoRepository.js
│   ├── ComentarioRepository.js
│   └── LogRepository.js
├── services/                # Regras de negócio — orquestra repositories
│   ├── AuthService.js
│   ├── UsuarioService.js
│   ├── SetorService.js
│   ├── TarefaService.js
│   ├── KpiService.js
│   ├── ComentarioService.js
│   ├── HistoricoService.js
│   ├── LogService.js
│   └── DiscordNotificationService.js
├── controllers/             # req/res — delega para services
│   ├── AuthController.js
│   ├── UsuarioController.js
│   ├── SetorController.js
│   ├── TarefaController.js
│   ├── KpiController.js
│   ├── ComentarioController.js
│   └── LogController.js
├── routes/
│   ├── index.js
│   ├── auth.routes.js
│   ├── usuario.routes.js
│   ├── setor.routes.js
│   ├── tarefa.routes.js
│   ├── kpi.routes.js
│   ├── comentario.routes.js
│   └── log.routes.js
├── middleware/
│   ├── auth.middleware.js      # Verifica JWT; injeta req.user
│   ├── role.middleware.js      # checkRoot, checkCargo, checkNotRoot
│   ├── validate.middleware.js  # Zod schemas
│   └── errorHandler.js        # Tratamento centralizado
├── schemas/                   # Contratos Zod de input
│   ├── auth.schema.js
│   ├── tarefa.schema.js
│   ├── usuario.schema.js
│   └── comentario.schema.js
├── errors/
│   └── AppError.js            # ForbiddenError, ConflictError, NotFoundError…
├── app.js
└── server.js
```

### Frontend

```
frontend/src/
├── services/                  # ÚNICA camada que usa axios — nunca fetch direto
│   ├── api.js                 # Instância axios: baseURL + interceptors JWT
│   ├── authService.js
│   ├── tarefaService.js
│   ├── usuarioService.js
│   ├── setorService.js
│   ├── kpiService.js
│   ├── comentarioService.js
│   └── logService.js
├── contexts/
│   ├── AuthContext.jsx        # Usuário logado, JWT, cargo, perfil
│   └── NotificationContext.jsx
├── hooks/
│   ├── useTarefas.js
│   ├── useKpis.js
│   ├── useUsuarios.js
│   ├── useSetores.js
│   ├── useComentarios.js
│   └── useLogs.js
├── components/
│   ├── kanban/
│   │   ├── KanbanBoard.jsx
│   │   ├── KanbanColumn.jsx   # Inclui mensagem de coluna vazia (§31)
│   │   └── TaskCard.jsx       # Variante: MinhasTarefas / CriadasPorMim
│   ├── sidebar/
│   │   ├── TaskSidebar.jsx    # Slide-in direita estilo Jira (§35)
│   │   ├── SidebarDetalhes.jsx
│   │   ├── SidebarHistorico.jsx
│   │   └── SidebarComentarios.jsx
│   ├── modals/
│   │   ├── CreateTaskModal.jsx
│   │   ├── ConfirmCreateModal.jsx   # Aviso: tarefa não pode ser excluída (§26)
│   │   ├── WaitingReasonModal.jsx   # Motivo obrigatório p/ AGUARDANDO (§31)
│   │   └── PriorityHelpModal.jsx    # Manual de prioridade (§22)
│   ├── kpi/
│   │   └── KpiCards.jsx             # 4 cards (§16)
│   ├── filters/
│   │   └── FilterBar.jsx            # Busca, prioridade, prazo, ordenação (§17)
│   ├── layout/
│   │   ├── AppLayout.jsx
│   │   ├── NavSidebar.jsx           # Navegação por cargo (§13)
│   │   └── ProtectedRoute.jsx
│   ├── root/
│   │   ├── LogTable.jsx             # Filtros por usuário e tipo de ação (§8)
│   │   ├── SectorCard.jsx           # Card de setor: nome, membros, coord. (§9)
│   │   └── UserTable.jsx            # Tabela de usuários (§11)
│   └── ui/
│       ├── Button.jsx
│       ├── Badge.jsx                # ATRASADA, URGENTE, status
│       ├── Input.jsx
│       ├── PinInput.jsx             # Input 6 dígitos para login
│       └── Spinner.jsx
└── pages/
    ├── LoginPage.jsx                # PIN input (§5)
    ├── RootTokenPage.jsx            # Pop-up token admin root (§6)
    ├── MinhasTarefasPage.jsx        # (§14) — sem botão criar
    ├── CriadasPorMimPage.jsx        # (§15) — com botão + NOVA TAREFA
    ├── MinhaEquipePage.jsx          # (§38–39) — coordenador only
    └── root/
        ├── RootLogsPage.jsx         # (§8)
        ├── RootEquipesPage.jsx      # (§9)
        └── RootUsuariosPage.jsx     # (§11)
```

### Bot Discord

```
bot/src/
├── api/
│   └── backendClient.js       # axios interno apontando p/ backend
├── commands/
│   └── vincular.js            # /vincular (§42)
├── handlers/
│   └── vincularHandler.js
├── services/
│   ├── vinculoService.js      # Lógica de vinculação (§42)
│   └── resumoService.js       # Formata resumo diário (§49)
├── notifications/
│   ├── taskCreated.js         # (§44)
│   ├── taskUpdated.js         # (§45)
│   ├── statusChanged.js       # (§46)
│   └── commentAdded.js        # (§47)
├── cron/
│   └── dailySummary.js        # node-cron 08:00 (§49)
└── bot.js
```

---

## Schema PostgreSQL Completo (§50–51)

```sql
-- Enums (§51)
CREATE TYPE cargo_enum      AS ENUM ('DIRETOR','GERENTE','COORDENADOR','FUNCIONARIO');
CREATE TYPE prioridade_enum AS ENUM ('BAIXA','NORMAL','URGENTE');
CREATE TYPE status_enum     AS ENUM ('PENDENTE','EM_ANDAMENTO','AGUARDANDO','CONCLUIDA');

-- Setores (§9–10)
CREATE TABLE setores (
  id   SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE
);
-- Seed obrigatório: 'Direção', 'Gerência' (sem coord/func §10)

-- Usuários (§3–4, §11, §41)
CREATE TABLE usuarios (
  id                SERIAL PRIMARY KEY,
  nome              VARCHAR(150) NOT NULL,
  pin               CHAR(6)      NOT NULL UNIQUE,   -- 6 dígitos (§4)
  cargo             cargo_enum   NOT NULL,
  setor_id          INT          REFERENCES setores(id),
  ativo             BOOLEAN      NOT NULL DEFAULT TRUE,
  discord_id        VARCHAR(30),                    -- ID do usuário no Discord (§41)
  discord_vinculado BOOLEAN      NOT NULL DEFAULT FALSE
);
-- Root não existe como linha nesta tabela; é identificado pelo PIN 000000 (§6)

-- Tarefas (§25, §51)
CREATE TABLE tarefas (
  id             SERIAL PRIMARY KEY,
  titulo         VARCHAR(255)    NOT NULL,
  descricao      TEXT            NOT NULL,
  criador_id     INT             NOT NULL REFERENCES usuarios(id),
  responsavel_id INT             NOT NULL REFERENCES usuarios(id),
  setor_id       INT             NOT NULL REFERENCES setores(id),
  prioridade     prioridade_enum NOT NULL,
  status         status_enum     NOT NULL DEFAULT 'PENDENTE',
  prazo          TIMESTAMPTZ     NOT NULL,          -- data + hora obrigatórios (§23)
  criado_em      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  concluido_em   TIMESTAMPTZ                        -- preenchido ao concluir (§29)
);
-- Sem coluna deleted_at — exclusão é impossível (§27, §54)

-- Histórico permanente das tarefas (§30)
CREATE TABLE historico_tarefas (
  id           SERIAL PRIMARY KEY,
  tarefa_id    INT         NOT NULL REFERENCES tarefas(id),
  usuario_id   INT         NOT NULL REFERENCES usuarios(id),
  tipo         VARCHAR(80) NOT NULL,   -- 'CRIACAO','EDICAO_TITULO','MUDANCA_STATUS','AGUARDANDO','COMENTARIO'…
  valor_antes  TEXT,
  valor_depois TEXT,
  descricao    TEXT,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários (§36, §47)
CREATE TABLE comentarios (
  id        SERIAL PRIMARY KEY,
  tarefa_id INT         NOT NULL REFERENCES tarefas(id),
  autor_id  INT         NOT NULL REFERENCES usuarios(id),
  conteudo  TEXT        NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Comentários em tarefa CONCLUÍDA são bloqueados pelo backend (§29)

-- Logs globais do sistema (§8)
CREATE TABLE logs (
  id          SERIAL PRIMARY KEY,
  usuario_id  INT         REFERENCES usuarios(id), -- NULL possível p/ root
  tipo_evento VARCHAR(80) NOT NULL,
  descricao   TEXT,
  valor_antes TEXT,
  valor_depois TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Endpoints da API REST

| Método | Rota | Controller | Acesso |
|---|---|---|---|
| POST | `/api/auth/login` | AuthController | Público |
| GET | `/api/usuarios` | UsuarioController | Root |
| POST | `/api/usuarios` | UsuarioController | Root |
| PATCH | `/api/usuarios/:id/status` | UsuarioController | Root (valida tarefas abertas §12) |
| GET | `/api/setores` | SetorController | Autenticado |
| POST | `/api/setores` | SetorController | Root |
| PATCH | `/api/setores/:id` | SetorController | Root |
| GET | `/api/tarefas/minhas` | TarefaController | Autenticado |
| GET | `/api/tarefas/criadas` | TarefaController | Autenticado |
| GET | `/api/tarefas/equipe` | TarefaController | Coordenador |
| POST | `/api/tarefas` | TarefaController | Não-Root, ativo |
| PATCH | `/api/tarefas/:id` | TarefaController | Criador, não concluída |
| PATCH | `/api/tarefas/:id/status` | TarefaController | Responsável, regras §19 |
| GET | `/api/tarefas/:id` | TarefaController | Com acesso §40 |
| POST | `/api/tarefas/:id/comentarios` | ComentarioController | Com permissão §36 |
| GET | `/api/kpis` | KpiController | Autenticado (calcula no backend §16) |
| GET | `/api/kpis/equipe` | KpiController | Coordenador |
| GET | `/api/logs` | LogController | Root (filtros: usuário, tipo §8) |
| POST | `/api/discord/vincular` | DiscordController | Bot interno |
| GET | `/api/discord/resumo/:userId` | DiscordController | Bot interno |

> [!CAUTION]
> **DELETE não existe em nenhuma rota de tarefa.** Qualquer tentativa retorna `405 Method Not Allowed` (§27, §54).

---

## Regras de Negócio por Requisito

### Autenticação (§5–6, §55)

**Usuário normal:**
1. Frontend envia PIN de 6 dígitos
2. Backend busca `usuarios WHERE pin = :pin`
3. Verifica `ativo = true` → se falso, retorna `403 Forbidden`
4. Gera JWT com `{ id, nome, cargo, setor_id }` e retorna
5. PIN nunca aparece em cards, tarefas, seleções ou respostas da API (§5)

**Root (§6):**
1. Frontend detecta PIN `000000` → não envia ainda
2. Abre pop-up solicitando **token administrativo**
3. Backend recebe `{ pin: '000000', adminToken: '...' }`
4. Compara `adminToken` com `process.env.ROOT_ADMIN_TOKEN`
5. Se correto → gera JWT com `{ role: 'ROOT' }` e retorna
6. `ROOT_ADMIN_TOKEN` existe apenas na `.env`, nunca no banco

### Tipos de Usuário e Hierarquia (§3)

- Cargos: `DIRETOR`, `GERENTE`, `COORDENADOR`, `FUNCIONARIO`
- Hierarquia **não** limita criação de tarefas
- Root é papel especial; não tem cargo no banco
- **Ninguém pode criar tarefa para si mesmo** (§3, §25) → backend bloqueia com `403`

### Root — Restrições e Áreas (§7)

| Pode | Não pode |
|---|---|
| Visualizar todas as tarefas | Criar tarefa |
| Acessar Logs | Editar tarefa |
| Acessar Equipes | Movimentar tarefa no Kanban |
| Acessar Usuários | Comentar em tarefa |
| — | Excluir tarefa |

Áreas exclusivas do root: **Logs** · **Equipes** · **Usuários**

### Logs (§8)

Todo evento relevante gera um registro em `logs` contendo:
- `usuario_id`, `tipo_evento`, `descricao`, `valor_antes`, `valor_depois`, `criado_em`

Eventos obrigatoriamente logados:
- Acesso ao sistema (login)
- Criação de tarefa
- Alteração de qualquer campo da tarefa (§28)
- Mudança de status
- Comentário adicionado
- Ativação/inativação de usuário

Na tela de Logs do root → filtros por **usuário** e por **tipo de ação**

### Setores (§9–10)

- Entidades reais no banco com ID e nome
- Card na tela Equipes mostra: nome, quantidade de membros, coordenadores do setor
- **Root pode criar novos setores** via botão **+ Novo Setor** na tela Equipes
- Setores são editáveis pelo root (nome e membros)
- Um setor pode ter múltiplos coordenadores
- **Direção** e **Gerência** existem como setores reais criados no seed inicial, mas sem coordenadores e sem funcionários (§10)
- Coordenadores do setor veem as tarefas destinadas aos **funcionários** daquele setor (§9, §38)

### Usuários Inativos (§12)

Usuário inativo:
- Não pode fazer login → backend retorna `403`
- Não pode criar tarefas → backend bloqueia
- Não pode receber novas tarefas → não aparece na seleção de responsável
- Continua listado no painel do root como **Inativo**
- Pode ser reativado pelo root

> [!WARNING]
> **Não é permitido desativar um usuário com tarefas abertas (PENDENTE, EM_ANDAMENTO, AGUARDANDO).**
> Backend retorna `409 Conflict` com mensagem explicativa.

### Navegação por Cargo (§13)

| Cargo | Meu Trabalho | Organização |
|---|---|---|
| Diretor | Minhas Tarefas · Criadas por Mim | — |
| Gerente | Minhas Tarefas · Criadas por Mim | — |
| Funcionário | Minhas Tarefas · Criadas por Mim | — |
| Coordenador | Minhas Tarefas · Criadas por Mim | Minha Equipe |

NavSidebar renderiza itens dinamicamente com base no `cargo` do JWT.

### KPIs (§16) — Calculados exclusivamente no backend

| Card | Cálculo |
|---|---|
| **Abertas** | `status IN ('PENDENTE','EM_ANDAMENTO','AGUARDANDO')` |
| **Atrasadas** | `prazo < NOW() AND status != 'CONCLUIDA'` |
| **Concluídas (7 dias)** | `status = 'CONCLUIDA' AND concluido_em >= NOW() - 7 days` |
| **Em Andamento** | `status IN ('EM_ANDAMENTO','AGUARDANDO')` |

KpiService calcula para `GET /api/kpis` (tarefas do usuário logado) e `GET /api/kpis/equipe` (coordenador).

### Filtros (§17)

Disponíveis nas telas de tarefas:
- **Busca** por nome/título (query param `search`)
- **Filtro por prioridade** (`BAIXA`, `NORMAL`, `URGENTE`)
- **Filtro por prazo** (campo de data)
- **Ordenação** por tarefas criadas mais recentemente (default)

### Status e Fluxo Kanban (§18–19, §31)

Fluxo permitido:
```
PENDENTE     → EM_ANDAMENTO  ✔
PENDENTE     → AGUARDANDO    ✔  (motivo obrigatório)
EM_ANDAMENTO → AGUARDANDO    ✔  (motivo obrigatório)
EM_ANDAMENTO → CONCLUIDA     ✔
AGUARDANDO   → EM_ANDAMENTO  ✔
AGUARDANDO   → CONCLUIDA     ✔
* → PENDENTE                 ✖  (proibido após iniciada)
CONCLUIDA → *                ✖  (bloqueio permanente §29)
```

- Mudança ocorre **exclusivamente via drag-and-drop no Kanban** (§19)
- **Não existem botões de alteração de status na sidebar** (§19)
- Ao arrastar para **AGUARDANDO** → abre `WaitingReasonModal`; sem motivo preenchido, drop é cancelado e card volta
- Coluna vazia exibe mensagem informando ausência de tarefas (§31)
- **Somente o responsável** pode movimentar a tarefa (§20, §40)

### Concluídas no Kanban (§32)

- Coluna CONCLUÍDA exibe apenas tarefas dos **últimos 7 dias**
- Tarefas antigas permanecem no banco, acessíveis via histórico

### Cards (§33–34)

**Card — Minhas Tarefas:**
título · quem enviou · setor · prioridade · badge ATRASADA (se aplicável)

**Card — Criadas por Mim:**
título · responsável · setor · prioridade · badge ATRASADA (se aplicável)

### Tarefa Atrasada (§24)

Lógica no backend:
```
now() > prazo AND status != 'CONCLUIDA'  →  atrasada = true
```
Frontend exibe badge visual **ATRASADA** no card e na sidebar.

### Criação de Tarefa (§25–26)

Campos obrigatórios (todos):
- título · descrição · setor · responsável · prioridade · data de entrega · hora de entrega

Ao selecionar setor → backend filtra usuários `WHERE setor_id = :id AND ativo = TRUE`.
Criador é automaticamente removido das opções (§3, §25).
PIN/token nunca é exibido na seleção (§5).

**Fluxo de confirmação (§26):**
1. Usuário preenche formulário
2. Clica em Criar
3. Sistema exibe `ConfirmCreateModal` com aviso: **"A tarefa não poderá ser excluída após sua criação"**
4. Usuário confirma
5. `POST /api/tarefas` é disparado

### Exclusão (§27, §54)

- Endpoint DELETE **não existe** → `405 Method Not Allowed`
- Nenhum papel (root, criador, responsável, coordenador) pode excluir
- Toda tarefa permanece no banco para sempre

### Alteração da Tarefa (§28)

- Somente o **criador** pode alterar
- Bloqueada se `status = 'CONCLUIDA'`
- Campos editáveis: título, descrição, setor, responsável, prioridade, data, hora
- Cada alteração grava em `historico_tarefas`: `tipo`, `valor_antes`, `valor_depois`
- `HistoricoService.registrarAlteracao()` chamado automaticamente pelo `TarefaService`

### Tarefa Concluída (§29)

Após conclusão, todos os campos ficam bloqueados no backend:
- título · descrição · setor · responsável · prioridade · prazo · status
- **Comentários também são bloqueados** (§29)
- Tarefa disponível apenas para leitura

### Histórico da Tarefa (§30)

Sidebar exibe histórico completo com eventos:
- Criação
- Alteração de qualquer campo (antes → depois)
- Mudança de prioridade
- Mudança de responsável
- Mudança de setor
- Alteração de prazo
- Mudança de status
- Entrada em AGUARDANDO + motivo
- Comentários adicionados

Formato visual: `Campo: "valor anterior" → "valor novo"` com data/hora e autor

### Sidebar de Detalhes (§35)

- Abre ao clicar em qualquer card, em qualquer tela
- **Slide-in da direita, estilo Jira** (~420px); nunca pop-up central
- Conteúdo exibido: título · descrição · status · prioridade · setor · criador · responsável · data e hora do prazo · badge ATRASADA · histórico · motivos de AGUARDANDO · comentários

### Comentários — Permissões por Tipo de Responsável (§36–37)

| Responsável da tarefa | Quem pode comentar |
|---|---|
| Funcionário | Criador + Funcionário responsável + Coordenadores do setor do funcionário |
| Coordenador | Criador + Coordenador responsável |
| Gerente | Criador + Gerente responsável |
| Diretor | Criador + Diretor responsável |

**Onde cada papel comenta:**
- **Criador** → sidebar em *Criadas por Mim*
- **Responsável** → sidebar em *Minhas Tarefas*
- **Coordenador** → sidebar em *Organização → Minha Equipe*

Comentários em tarefa CONCLUÍDA são bloqueados (§29).
Cada comentário gera: registro no banco + entrada no histórico + log + notificação Discord aos envolvidos com acesso (§47).

### Minha Equipe — Coordenador (§38–39)

Exibe tarefas destinadas aos **funcionários do setor** do coordenador.

**Não exibe:**
- Tarefas destinadas ao próprio coordenador
- Tarefas de funcionários enviadas a pessoas de outros setores
- Tarefas de outros setores

**Tela Minha Equipe contém:**
- Contadores de tarefas por status (mesmos 4 KPIs adaptados para a equipe)
- Listagem com: prioridade · nome da tarefa · criador · responsável · status atual · data e hora de entrega
- Ao clicar → abre sidebar de detalhes (coordenador pode comentar se permitido §36)

Se existirem múltiplos coordenadores no mesmo setor, todos têm acesso (§9, §38).

### Tela de Usuários — Root (§11–12)

Cada usuário exibe:
- nome · cargo · setor · situação (Ativo / Inativo) · situação do Discord (Vinculado / Não vinculado)
- **PIN nunca exibido** (§11)

Ações disponíveis: **criar usuário** · ativar / inativar (com validação de tarefas abertas §12)

### Tela de Equipes — Root (§9)

Exibe cards de todos os setores cadastrados.
Cada card: nome do setor · quantidade de membros · coordenadores do setor.

Ações disponíveis:
- **+ Novo Setor** → modal de criação (nome obrigatório)
- **Editar setor** → modal de edição (nome, membros, coordenadores)

Setores `Direção` e `Gerência` criados automaticamente no seed (sem coord/func §10).

### Manual de Prioridade (§22)

Botão de ajuda (?) ao lado do campo Prioridade no formulário de criação/edição.
Abre `PriorityHelpModal` com descrição das 3 prioridades e exemplos:

| Prioridade | Quando usar | Exemplos |
|---|---|---|
| **Baixa** | Pode esperar sem prejuízo ou atraso | Organizar arquivos, ajuste visual, tarefa sem data crítica |
| **Normal** | Fluxo normal, sem interrupção | Relatório da semana, cotação com prazo de dias |
| **Urgente** | Prazo imediato, bloqueio ou risco real | Sistema parado, documento vencendo hoje |

Pop-up apenas informativo, sem ações.

### Prazo (§23)

- `data de entrega` e `hora de entrega` são obrigatórios e separados no formulário
- Backend valida: ambos presentes → converte para `TIMESTAMPTZ`
- Não é permitido criar ou salvar tarefa sem ambos

---

## Permissões Completas (§40)

| Ação | Root | Criador | Responsável | Coordenador do setor |
|---|:---:|:---:|:---:|:---:|
| Visualizar tarefa | ✅ (todas) | ✅ | ✅ | ✅ (func. do setor) |
| Criar tarefa | ❌ | ✅ | ✅ | ✅ |
| Excluir | ❌ | ❌ | ❌ | ❌ |
| Editar dados | ❌ | ✅ (não concluída) | ❌ | ❌ |
| Alterar status | ❌ | ❌ | ✅ | ❌ |
| Comentar | ❌ | ✅ | ✅ | ✅ (quando permitido §36) |
| Ver histórico | ✅ | ✅ | ✅ | ✅ (quando tem acesso) |

---

## Bot Discord — Requisitos Completos (§41–49)

### Vinculação (§42)

1. Usuário inicia interação com o bot no Discord
2. Bot solicita PIN/token de 6 dígitos
3. Usuário informa o código
4. Bot chama `POST /api/discord/vincular` no backend
5. Backend: busca usuário por PIN → vincula `discord_id` + `discord_vinculado = true`
6. Relação: **1 PIN → 1 usuário** · **1 usuário → 1 vínculo Discord**
7. Token administrativo do root **não participa** desse processo

### Primeiro resumo após vínculo (§43)

Imediatamente após vincular, usuário recebe resumo atual:
- Abertas · Atrasadas · Concluídas (7 dias) · Em Andamento

### Notificações (§44–48)

| Evento | Quem recebe | Observação |
|---|---|---|
| Tarefa criada | Criador (confirmação) + Responsável (aviso) | §44 |
| Dados alterados | Responsável (campo anterior → novo) | §45 |
| Status alterado | Criador | Responsável não notificado da própria ação §46, §48 |
| Status → AGUARDANDO | Criador (com motivo) | §46 |
| Comentário adicionado | Todos com acesso (exceto o próprio autor) | §47, §48 |

> [!IMPORTANT]
> **Regra anti-spam (§48):** O Discord nunca notifica o usuário sobre ações que ele mesmo acabou de realizar.

### Resumo Diário (§49)

- **Todo dia às 08:00** (cron job com `node-cron`)
- Enviado para todos os usuários com `discord_vinculado = true`
- Conteúdo: os mesmos 4 indicadores (Abertas · Atrasadas · Concluídas 7 dias · Em Andamento)

---

## Regras Obrigatórias no Backend (§52)

O backend valida **obrigatoriamente**:

| Regra |
|---|
| PIN/token válido |
| Usuário ativo |
| Acesso root (PIN 000000 + token .env) |
| Token administrativo do root |
| Criação de tarefa para si mesmo → bloqueado |
| Responsável ativo ao criar/editar |
| Setor informado e existente |
| Data e hora de entrega obrigatórios |
| Prioridade válida (enum) |
| Status válido (enum) |
| Movimentação de status dentro do fluxo permitido |
| Motivo obrigatório ao mover para AGUARDANDO |
| Tarefa CONCLUÍDA — todos os campos bloqueados |
| Impossibilidade de exclusão — endpoint inexistente |
| Permissão de edição (somente criador) |
| Permissão de comentário (por tipo de responsável §36) |
| Acesso de coordenadores (somente funcionários do setor) |
| Desativação de usuário com tarefas abertas → bloqueado |
| Cálculo de atraso (`prazo < now && status != CONCLUIDA`) |
| Cálculo dos 4 KPIs |

**O React não é a fonte de verdade** — validações no frontend são apenas UX; todas as regras são aplicadas novamente no backend.

### Regra de Integridade (§54)

- Tarefa nunca pode ser apagada
- Todas as alterações são registradas
- Histórico é permanente
- Tarefa é bloqueada após concluída

---

## Fluxo de Dados Exemplo — Criação de Tarefa (§53)

```
[React] CriadasPorMimPage
  └─► CreateTaskModal
      └─► ConfirmCreateModal (aviso de não exclusão §26)
          └─► tarefaService.criar() [services/tarefaService.js]
              └─► POST /api/tarefas

[Node.js]
  tarefa.routes.js        → auth middleware → validate(tarefaSchema)
  TarefaController.criar  → extrai req.body e req.user
  TarefaService.criar     →
    ├─ valida criador != responsável
    ├─ valida responsável ativo
    ├─ valida prazo (data + hora presentes)
    ├─ TarefaRepository.inserir()
    ├─ HistoricoRepository.registrar({ tipo: 'CRIACAO' })
    ├─ LogRepository.registrar({ tipo_evento: 'CRIACAO_TAREFA' })
    └─ DiscordNotificationService.notificarCriacao()
        ├─ DM ao criador (confirmação)
        └─ DM ao responsável (aviso de nova tarefa)
```

---

## Variáveis de Ambiente (`.env`)

```env
# Backend
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:pass@postgres:5432/portal
JWT_SECRET=...
JWT_EXPIRES_IN=12h                  # Sessão de 12 horas
ROOT_ADMIN_TOKEN=...                # Token administrativo do root (§6, §55)

# Discord Bot
DISCORD_BOT_TOKEN=...
BACKEND_INTERNAL_URL=http://backend:4000

# Cron
CRON_TIMEZONE=America/Sao_Paulo     # Resumo diário 08:00
```

---

## Ordem de Implementação

```
Fase 1 — Infraestrutura
  1. docker-compose.yml (4 containers)
  2. .env.example + config/env.js (validação no boot)
  3. Migrations PostgreSQL + seed (setores Direção e Gerência)

Fase 2 — Backend (camada por camada, de baixo para cima)
  4. enums.js + AppError classes
  5. database.js (pool pg)
  6. Repositories (CRUD SQL puro)
  7. Services (regras de negócio, KPIs, histórico, logs)
  8. Controllers (req/res)
  9. Routes + middlewares (auth, role, validate, errorHandler)
 10. Testes de integração (Jest + Supertest)

Fase 3 — Frontend (camada por camada)
 11. Design system: CSS custom properties, tipografia Inter, paleta clara
 12. services/api.js + interceptors JWT + services individuais
 13. AuthContext + ProtectedRoute + NavSidebar dinâmica por cargo
 14. Hooks customizados
 15. Componentes UI atômicos (Button, Badge, PinInput…)
 16. KanbanBoard + KanbanColumn (com mensagem de vazio) + TaskCard
 17. TaskSidebar (detalhes, histórico, comentários)
 18. KpiCards + FilterBar
 19. Modais (CreateTask, ConfirmCreate, WaitingReason, PriorityHelp)
 20. LoginPage + RootTokenPage
 21. MinhasTarefasPage + CriadasPorMimPage
 22. MinhaEquipePage (coordenador)
 23. Páginas Root (Logs, Equipes, Usuários)

Fase 4 — Bot Discord
 24. backendClient.js
 25. Comando /vincular + handler + vinculoService
 26. Funções de notificação (taskCreated, taskUpdated, statusChanged, commentAdded)
 27. Cron dailySummary (08:00)

Fase 5 — Validação Final
 28. Testes end-to-end dos fluxos críticos
 29. Docker build completo + verificação de ambiente
```

---

## Verification Plan

### Testes Automatizados
```bash
npm run test             # Jest + Supertest
npm run test:coverage    # Cobertura mínima 80%
```

**Casos obrigatórios:**
- Login com PIN válido → JWT retornado
- Login com PIN inválido → 401
- Login com usuário inativo → 403
- Login root (000000 + token correto) → JWT root
- Login root (000000 + token errado) → 403
- Criar tarefa para si mesmo → 403
- Criar tarefa para usuário inativo → 422
- Criar tarefa sem prazo → 422
- Movimentações proibidas de status → 422
- AGUARDANDO sem motivo → 422
- Editar tarefa concluída → 403
- Desativar usuário com tarefa aberta → 409
- DELETE em tarefa → 405

### Verificação Manual
- [ ] Login PIN 6 dígitos redireciona corretamente por cargo
- [ ] Login root abre pop-up de token antes de entrar
- [ ] NavSidebar exibe "Minha Equipe" apenas para coordenadores
- [ ] Tela Minhas Tarefas **não** tem botão "+ NOVA TAREFA"
- [ ] Tela Criadas por Mim **tem** botão "+ NOVA TAREFA"
- [ ] Drag-and-drop persiste no banco; erro reverte o card
- [ ] Mover para AGUARDANDO sem motivo bloqueia e cancela o drop
- [ ] Badge ATRASADA aparece corretamente em cards e sidebar
- [ ] Sidebar desliza da direita ao clicar em qualquer card
- [ ] Histórico exibe antes → depois com autor e data/hora
- [ ] Comentários bloqueados em tarefa concluída
- [ ] Coordenador vê apenas tarefas dos funcionários do seu setor
- [ ] Root não pode criar, editar, mover nem comentar
- [ ] Root vê filtros de logs por usuário e tipo de ação
- [ ] Bot responde `/vincular` e envia resumo imediato
- [ ] Cron 08:00 dispara apenas para usuários com Discord vinculado
- [ ] Usuário não recebe notificação da própria ação (anti-spam)
- [ ] PIN nunca aparece em nenhuma resposta da API nem na UI
- [ ] Layout desktop ocupa toda a largura disponível sem scroll horizontal desnecessário
