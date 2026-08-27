# 📋 Manual do Usuário — Portal de Gestão de Tarefas

---

## Primeiro Acesso

### 1. Seu PIN

O administrador do sistema vai te fornecer um **PIN de 6 dígitos** pessoal e intransferível.
Guarde-o com segredo — ele é a sua senha de acesso.

> ⚠️ **Nunca compartilhe seu PIN com ninguém.**

---

### 2. Vincular conta Discord (obrigatório)

Antes de acessar o sistema pela primeira vez, você **precisa vincular seu Discord**.

**Passos:**

1. Abra o Discord e encontre o **Bot do Portal de Tarefas**
2. Envie uma mensagem direta (DM) para o bot:
   ```
   /vincular SEU_PIN_AQUI
   ```
   Exemplo:
   ```
   /vincular 123456
   ```
3. O bot responderá com uma confirmação e mostrará seu resumo de tarefas
4. Agora você já pode acessar o site normalmente

> 💡 Após vincular, abra as **Mensagens Diretas** (DMs) do Discord — você receberá notificações de tarefas por lá.

---

## Fazendo Login

### Login normal (após vincular o Discord)

1. Acesse o portal pelo navegador
2. Digite seu **PIN de 6 dígitos** nas células
3. Clique em **Entrar**
4. O sistema envia um **código de confirmação** por DM no Discord
5. Abra o Discord, copie o código (ex: `A3F7K2`)
6. Cole o código no campo do site e clique em **Confirmar acesso**
7. Você está dentro! ✅

> 🔐 **Por que esse passo extra?** É uma camada de segurança: mesmo que alguém descubra seu PIN, precisaria ter acesso ao seu Discord para entrar.
> O código expira em **5 minutos**.

### Sessão expirada

A sessão dura **8 horas**. Quando expirar, o sistema pedirá seu PIN novamente e enviará um novo código de confirmação.

---

## Tela Principal — Kanban

O sistema organiza suas tarefas em 4 colunas:

| Coluna | Significado |
|---|---|
| 📭 **Pendente** | Tarefa criada, ainda não iniciada |
| ⚡ **Em Andamento** | Você está trabalhando nela |
| ⏸️ **Aguardando** | Pausada por um motivo (ex: aprovação, material) |
| ✅ **Concluída** | Finalizada |

---

## Minhas Tarefas

Aqui ficam todas as tarefas em que **você é o responsável**.

### Como mover uma tarefa (drag & drop)

- **Arraste** o card de uma coluna para outra
- O sistema valida se a transição é permitida:

```
Pendente     → Em Andamento  ✅
Pendente     → Aguardando    ✅
Em Andamento → Aguardando    ✅
Em Andamento → Concluída     ✅
Aguardando   → Em Andamento  ✅
Aguardando   → Concluída     ✅
Concluída    → qualquer      ❌ (não pode reverter)
```

### Mover para "Aguardando"

Ao mover para **Aguardando**, o sistema **exige um motivo**:
- "Aguardando aprovação do gerente"
- "Material em falta"
- etc.

O motivo fica registrado no histórico.

---

## Criadas por Mim

Aqui ficam as tarefas que **você criou para outros**.

### Criar uma nova tarefa

1. Clique em **＋ Nova Tarefa**
2. Preencha:
   - **Título** — breve e descritivo
   - **Descrição** — detalhes do que precisa ser feito
   - **Setor** — em qual setor está o responsável
   - **Responsável** — quem vai executar (não pode ser você mesmo)
   - **Prioridade** — veja tabela abaixo
   - **Data e hora de entrega** — prazo final
3. Clique em **Criar Tarefa**
4. Confirme o aviso — **tarefas não podem ser excluídas após criadas**

### Prioridades

| Nível | Quando usar | Exemplos |
|---|---|---|
| 🟢 **Baixa** | Pode esperar sem prejuízo | Organização, ajuste visual |
| 🔵 **Normal** | Fluxo normal do trabalho | Relatório semanal, cotação |
| 🔴 **Urgente** | Prazo imediato ou risco real | Sistema parado, doc vencendo hoje |

> ❓ Clique no botão **?** ao lado de "Prioridade" para ver o guia detalhado.

---

## Detalhes de uma Tarefa

Clique em qualquer card para abrir o **painel de detalhes** (sidebar direita).

### Aba Detalhes
- Descrição completa
- Criador, Responsável, Setor
- Prazo, data de criação e conclusão

### Aba Histórico 🕒
- Registro permanente de **todas** as ações na tarefa:
  - Quando foi criada
  - Mudanças de status (e motivos)
  - Edições de campos
  - Comentários

> O histórico **nunca pode ser apagado** — é o log de auditoria da tarefa.

### Aba Comentários 💬
- Adicione observações, atualizações ou dúvidas
- Todos os envolvidos (criador e responsável) recebem notificação no Discord
- Comentários são bloqueados após a tarefa ser **Concluída**

---

## Notificações Discord

Você receberá DMs do bot nas seguintes situações:

| Evento | Quem recebe |
|---|---|
| Nova tarefa criada para você | Responsável |
| Tarefa atribuída a você editada | Responsável |
| Status de sua tarefa alterado | Criador |
| Novo comentário em tarefa sua | Criador e Responsável |
| Confirmação de login (código) | Você mesmo |
| Resumo diário às **08:00** | Todos com tarefas abertas ou atrasadas |

---

## Funcionalidades por Cargo

### 👷 Funcionário
- Ver e mover **suas próprias tarefas** (Minhas Tarefas)
- Ver tarefas que criou (Criadas por Mim)
- Criar tarefas para outros funcionários
- Comentar em tarefas que está envolvido

### 👑 Coordenador
- Tudo do Funcionário
- Acesso à tela **Minha Equipe**: visão de todas as tarefas dos funcionários do seu setor
- Pode comentar nas tarefas da sua equipe

### 🎯 Gerente / Diretor
- Mesmo acesso do Funcionário no sistema
- *(Acesso expandido pode ser configurado pelo Root)*

### 🔑 Root (Administrador)
- Acesso via PIN `000000` + token administrativo
- **Gerenciar Equipes** — criar e editar setores
- **Gerenciar Usuários** — criar usuários, ativar/desativar
- **Logs** — histórico completo de todos os eventos do sistema
- Não aparece como responsável ou criador de tarefas

---

## Regras importantes

| Regra | Motivo |
|---|---|
| Tarefas **não podem ser excluídas** | Auditoria e rastreabilidade |
| Você **não pode criar tarefas para si mesmo** | Responsabilidade deve ser de outra pessoa |
| Status **Concluída é irreversível** | Garante integridade do histórico |
| PIN `000000` é reservado ao Root | Nunca atribuir a usuários |
| Um usuário **inativo não pode receber tarefas** | Só é desativado se não tiver tarefas abertas |

---

## Filtros

Em todas as telas de tarefas, use a barra de filtros para:
- 🔍 **Buscar** por título
- 📌 **Filtrar por prioridade** (Baixa, Normal, Urgente)
- 📅 **Filtrar por data de entrega**

Para limpar os filtros, clique em **✕ Limpar**.

---

## Problemas comuns

| Problema | Solução |
|---|---|
| Não consigo entrar — "Vincule seu Discord" | Envie `/vincular SEU_PIN` por DM para o bot |
| Não recebi o código de confirmação | Verifique se o Discord permite DMs · Aguarde 30s e tente novamente |
| Código expirado | Faça login novamente para gerar um novo código |
| Não consigo mover uma tarefa | Verifique se você é o responsável e se a transição é permitida |
| Não vejo a equipe no menu | Apenas Coordenadores têm acesso a "Minha Equipe" |
| Não consigo criar tarefa para usuário X | Verifique se o usuário está ativo e pertence ao setor selecionado |
