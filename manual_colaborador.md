# 📘 MANUAL DO USUÁRIO & ALTO ESCALÃO
## PORTAL CORPORATIVO DE GESTÃO DE TAREFAS

```
================================================================================
Documento Oficial: Manual Operacional do Colaborador e Liderança
Versão: 2.0 (Edição Corporativa)
Público-Alvo: Funcionários, Coordenadores, Gerentes e Diretores
Sistema: Portal de Tarefas Web + Integração Discord Notifier
Classificação: Uso Interno Confidencial
================================================================================
```

---

# 📑 SUMÁRIO GERAL

1. [Visão Geral e Objetivos do Sistema](#1-visão-geral-e-objetivos-do-sistema)
2. [Primeiro Acesso e Segurança](#2-primeiro-acesso-e-segurança)
   - 2.1 [O PIN Pessoal de 6 Dígitos](#21-o-pin-pessoal-de-6-dígitos)
   - 2.2 [Vinculação Obrigatória com o Discord (2FA)](#22-vinculação-obrigatória-com-o-discord-2fa)
3. [Autenticação e Sessão](#3-autenticação-e-sessão)
   - 3.1 [Fluxo de Login com Verificação em Duas Etapas](#31-fluxo-de-login-com-verificação-em-duas-etapas)
   - 3.2 [Duração da Sessão e Renovação](#32-duração-da-sessão-e-renovação)
4. [Estrutura da Interface e Navegação](#4-estrutura-da-interface-e-navegação)
   - 4.1 [Barra Lateral (Menu de Navegação)](#41-barra-lateral-menu-de-navegação)
   - 4.2 [Painel Superior de Indicadores (KPIs)](#42-painel-superior-de-indicadores-kpis)
   - 4.3 [Barra de Busca e Filtros Inteligentes](#43-barra-de-busca-e-filtros-inteligentes)
5. [Quadro Operacional Kanban](#5-quadro-operacional-kanban)
   - 5.1 [Colunas e Ciclo de Vida da Tarefa](#51-colunas-e-ciclo-de-vida-da-tarefa)
   - 5.2 [Regras Rígidas de Movimentação](#52-regras-rígidas-de-movimentação)
   - 5.3 [Pausando Tarefas (Justificativa Obrigatória de "Aguardando")](#53-pausando-tarefas-justificativa-obrigatória-de-aguardando)
   - 5.4 [Conclusão Irreversível de Tarefas](#54-conclusão-irreversível-de-tarefas)
6. [Criação e Gestão de Tarefas](#6-criação-e-gestão-de-tarefas)
   - 6.1 [Criando uma Tarefa "Para Mim" (Pessoal)](#61-criando-uma-tarefa-para-mim-pessoal)
   - 6.2 [Criando uma Tarefa "Para Outra Pessoa" (Delegação)](#62-criando-uma-tarefa-para-outra-pessoa-delegação)
   - 6.3 [Seletores Modernos de Calendário e Horário](#63-seletores-modernos-de-calendário-e-horário)
   - 6.4 [Matriz Corporativa de Prioridades](#64-matriz-corporativa-de-prioridades)
7. [Painel de Detalhes, Auditoria e Comunicação](#7-painel-de-detalhes-auditoria-e-comunicação)
   - 7.1 [Aba "Detalhes" e Metadados](#71-aba-detalhes-e-metadados)
   - 7.2 [Aba "Histórico" (Auditoria Imutável)](#72-aba-histórico-auditoria-imutável)
   - 7.3 [Aba "Comentários" e Alertas aos Envolvidos](#73-aba-comentários-e-alertas-aos-envolvidos)
8. [Módulo Especial: O "Alto Escalão" (Coordenadores, Gerentes e Diretores)](#8-módulo-especial-o-alto-escalão-coordenadores-gerentes-e-diretores)
   - 8.1 [Visão Geral de Liderança](#81-visão-geral-de-liderança)
   - 8.2 [Tela "Minha Equipe" (Visão Departamental)](#82-tela-minha-equipe-visão-departamental)
   - 8.3 [Monitoramento de Gargalos e SLA](#83-monitoramento-de-gargalos-e-sla)
   - 8.4 [Intervenção e Alinhamento em Tarefas da Equipe](#84-intervenção-e-alinhamento-em-tarefas-da-equipe)
9. [Central de Notificações Discord e Rotinas](#9-central-de-notificações-discord-e-rotinas)
   - 9.1 [Eventos Notificados em Tempo Real](#91-eventos-notificados-em-tempo-real)
   - 9.2 [Resumo Diário Matinal (08:00)](#92-resumo-diário-matinal-0800)
10. [Regras de Negócio e Políticas Inegociáveis](#10-regras-de-negócio-e-políticas-inegociáveis)
11. [Perguntas Frequentes & Resolução de Problemas (FAQ)](#11-perguntas-frequentes--resolução-de-problemas-faq)

---

# 1. Visão Geral e Objetivos do Sistema

O **Portal de Gestão de Tarefas** é a plataforma corporativa oficial para registro, execução, delegação e acompanhamento de atividades no ambiente de trabalho.

### Objetivos Principais:
- **Centralização Operacional**: Eliminar a perda de demandas transmitidas verbalmente ou em conversas paralelas.
- **Transparência e Rastreabilidade**: Cada ação no sistema gera histórico auditável com data, hora e autor.
- **Eficiência e Controle de Prazos**: Alertas visuais e notificações diretas evitam atrasos em entregas críticas.
- **Integração Interdepartamental**: Colaboradores de qualquer setor podem registrar demandas para colegas sem fricção burocrática.

---

# 2. Primeiro Acesso e Segurança

## 2.1 O PIN Pessoal de 6 Dígitos
Cada colaborador recebe da equipe de TI/Root um **PIN exclusivo de 6 dígitos numéricos** (ex: `482910`).
- O PIN é sua credencial pessoal de identificação.
- **Nunca compartilhe seu PIN com colegas.**
- Seu PIN não é exibido em telas públicas, tarefas ou relatórios.

## 2.2 Vinculação Obrigatória com o Discord (2FA)
Antes de conseguir entrar no portal web pela primeira vez, você deve vincular sua conta do Discord ao bot corporativo.

### Passo a passo de vinculação:
1. Abra o aplicativo do **Discord**.
2. Localize o bot oficial do sistema na lista de membros ou no canal corporativo.
3. Abra as **Mensagens Diretas (DM)** com o bot.
4. Envie o comando:
   ```text
   /vincular SEU_PIN_DE_6_DIGITOS
   ```
   *Exemplo:* `/vincular 482910`
5. O bot responderá instantaneamente confirmando a vinculação e exibindo suas informações cadastrais (Nome, Setor e Cargo).
6. Pronto! Sua conta está ativada para acesso via Web.

---

# 3. Autenticação e Sessão

## 3.1 Fluxo de Login com Verificação em Duas Etapas
Para garantir máxima segurança, o sistema utiliza autenticação em dois fatores:

```
[ Usuário digita PIN de 6 dígitos no site ]
                   │
                   ▼
[ Sistema valida PIN e envia Código de 6 letras por DM no Discord ]
                   │
                   ▼
[ Usuário copia código do Discord (ex: 'K9X2B4') e digita no Portal ]
                   │
                   ▼
[ Acesso Liberado ao Painel Principal ]
```

1. Acesse o endereço do Portal de Tarefas no seu navegador.
2. Na tela de login, insira seu **PIN de 6 dígitos**.
3. Clique em **Entrar**.
4. O sistema emitirá um código alfanumérico temporário (ex: `W4F8L2`) diretamente no seu Discord.
5. Digite o código de confirmação no site e clique em **Confirmar Acesso**.

> ⏱️ **Validade do código**: O código de verificação expira em **5 minutos**. Caso expire, basta reiniciar o login para receber um novo.

## 3.2 Duração da Sessão e Renovação
- A sessão autenticada permanece ativa por **8 horas consecutivas**.
- Ao final desse período, o sistema solicitará uma nova autenticação rápida para proteger os dados da estação de trabalho.

---

# 4. Estrutura da Interface e Navegação

## 4.1 Barra Lateral (Menu de Navegação)
Localizada à esquerda da tela, oferece acesso rápido aos módulos disponíveis de acordo com seu perfil:
- 📌 **Minhas Tarefas**: Visualização padrão de atividades sob sua responsabilidade.
- 👥 **Minha Equipe**: Disponível para **Coordenadores, Gerentes e Diretores**, exibindo o painel consolidado do departamento.
- 🌓 **Alternador de Tema**: Alternância entre Modo Claro (Warm Stone) e Modo Escuro.
- 🚪 **Sair**: Encerra sua sessão com segurança.

## 4.2 Painel Superior de Indicadores (KPIs)
Cards informativos no topo da tela refletem sua carga de trabalho em tempo real:
- 📋 **Total**: Quantidade geral de tarefas sob seu escopo.
- ⚡ **Em Andamento**: Demandas que estão sendo executadas no momento.
- ⏸️ **Aguardando**: Demandas pausadas por dependências externas.
- 🚨 **Atrasadas**: Tarefas cujo prazo limite foi ultrapassado e exigem atenção prioritária.
- ✅ **Concluídas (7d)**: Volume de entregas finalizadas nos últimos 7 dias.

## 4.3 Barra de Busca e Filtros Inteligentes
Localizada logo abaixo das abas de perspectiva:
- 🔍 **Busca por Texto**: Filtra cards em tempo real pelo título da tarefa.
- 🚩 **Filtro de Prioridade**: Dropdown com opções *Todas, Baixa, Normal e Urgente*.
- 📅 **Filtro por Prazo**: Seletor de data para localizar tarefas com vencimento específico.
- ✕ **Limpar Filtros**: Botão visível automaticamente quando há filtros ativos para restaurar a visualização completa.

---

# 5. Quadro Operacional Kanban

O trabalho é gerenciado visualmente através de um quadro Kanban organizado em 4 colunas sequenciais:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PENDENTE    │───>│ EM ANDAMENTO │<──>│  AGUARDANDO  │───>│  CONCLUÍDA   │
│  (A iniciar) │    │  (Em ação)   │    │  (Pausada)   │    │  (Finalizada)│
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

## 5.1 Colunas e Ciclo de Vida da Tarefa
1. **Pendente (📭)**: Tarefa atribuída e registrada no sistema, aguardando início dos trabalhos.
2. **Em Andamento (⚡)**: Colaborador iniciou ativamente a execução da demanda.
3. **Aguardando (⏸️)**: Trabalho pausado temporariamente devido a bloqueios externos (ex: retorno de cliente, aprovação de diretoria, peças).
4. **Concluída (✅)**: Atividade totalmente finalizada e entregue.

## 5.2 Regras Rígidas de Movimentação
O sistema valida a conformidade de cada transição via *Drag & Drop*:

| Origem | Destino | Permitido? | Condição / Observação |
|---|---|:---:|---|
| **Pendente** | **Em Andamento** | ✅ Sim | Início normal de atividade |
| **Pendente** | **Aguardando** | ✅ Sim | Exige preenchimento de justificativa |
| **Em Andamento** | **Aguardando** | ✅ Sim | Exige preenchimento de justificativa |
| **Em Andamento** | **Concluída** | ✅ Sim | Finalização com registro de data/hora |
| **Aguardando** | **Em Andamento** | ✅ Sim | Retomada dos trabalhos |
| **Aguardando** | **Concluída** | ✅ Sim | Finalização direta |
| **Concluída** | *Qualquer coluna* | ❌ Não | **Irreversível.** Não pode ser reaberta |

## 5.3 Pausando Tarefas (Justificativa Obrigatória de "Aguardando")
Ao arrastar qualquer card para a coluna **Aguardando**, o sistema abre imediatamente uma janela modal obrigatória:
- Você deve descrever claramente o motivo do bloqueio (ex: *"Aguardando aprovação do orçamento pelo financeiro"*).
- A justificativa é gravada no **Histórico de Auditoria** da tarefa e informada por notificação ao criador da demanda.

## 5.4 Conclusão Irreversível de Tarefas
Quando uma tarefa é movida para **Concluída**:
- O card é travado permanentemente para edição de dados.
- O campo de comentários é encerrado para novas mensagens.
- O criador da tarefa recebe notificação imediata no Discord.

---

# 6. Criação e Gestão de Tarefas

Para registrar uma nova atividade, clique no botão **＋ Nova Tarefa** no topo direito da tela. Uma janela interativa perguntará a finalidade:

```
┌──────────────────────────────────────────────────────────┐
│                 Essa tarefa é para quem?                 │
│                                                          │
│     ┌──────────────────────┐    ┌──────────────────────┐ │
│     │     👤 PARA MIM      │    │  👥 PARA OUTRA PESSOA│ │
│     │ (Organização própria)│    │   (Delegar a colega) │ │
│     └──────────────────────┘    └──────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## 6.1 Criando uma Tarefa "Para Mim" (Pessoal)
- Selecione **Para mim**.
- O sistema preenche seu Setor e seu Nome como Responsável automaticamente nos bastidores, mantendo o formulário enxuto.
- Informe apenas: **Título**, **Descrição** (opcional), **Prioridade**, **Data** e **Horário de Entrega**.

## 6.2 Criando uma Tarefa "Para Outra Pessoa" (Delegação)
- Selecione **Para outra pessoa**.
- Escolha o **Setor de Destino** no dropdown moderno.
- Selecione o **Responsável** daquele setor.
- Preencha o **Título**, a **Descrição detalhada**, o nível de **Prioridade** e o **Prazo (Data e Hora)**.

## 6.3 Seletores Modernos de Calendário e Horário
O sistema conta com seletores modernos desenvolvidos sob medida:
- **DatePicker (Calendário)**:
  - Navegação fluida de meses com indicador de ano.
  - Seleção em um clique do dia desejado.
  - Botão de atalho **"Hoje"** para datas imediatas e **"Limpar"** para resetar.
  - Posicionamento inteligente (abre para cima ou para baixo conforme o espaço em tela, evitando cortes).
- **TimePicker (Horário)**:
  - Seleção precisa em colunas organizadas de **Horas** e **Minutos** (intervalos de 10/15 minutos para agilidade operacional).

## 6.4 Matriz Corporativa de Prioridades

| Nível | Identificação Visual | Quando Utilizar | Exemplo Prático |
|---|:---:|---|---|
| 🟢 **Baixa** | Tag Verde | Atividades rotineiras sem impacto imediato caso postergadas | Organização de arquivos internos, atualização de planilhas de apoio |
| 🔵 **Normal** | Tag Azul | Fluxo operacional diário padrão com prazo acordado | Envio de relatório semanal, cotação de insumos, resposta a ticket |
| 🔴 **Urgente** | Tag Vermelha | Risco iminente de perda financeira, operacional ou legal | Servidor inoperante, prazo judicial/fiscal vencendo hoje |

---

# 7. Painel de Detalhes, Auditoria e Comunicação

Ao clicar em qualquer card do Kanban, abre-se a **Sidebar Lateral Direita** contendo 3 abas principais:

## 7.1 Aba "Detalhes" e Metadados
- Título e Descrição completa da demanda.
- Nome do Criador e do Responsável com seus respectivos avatares e setores.
- Prazo final e badge de status atualizado.
- Botão de edição rápida (disponível para os envolvidos enquanto a tarefa não estiver concluída).

## 7.2 Aba "Histórico" (Auditoria Imutável)
Uma linha do tempo cronológica com carimbo de data, hora e responsável por cada evento:
- Data e hora exata da criação da tarefa.
- Todas as alterações de status (incluindo as justificativas de pausa).
- Alterações em títulos, prazos ou prioridades.
- Nenhuma entrada do histórico pode ser editada ou deletada.

## 7.3 Aba "Comentários" e Alertas aos Envolvidos
- Chat interno atrelado à tarefa para alinhamento rápido de dúvidas, links ou atualizações de progresso.
- Cada novo comentário envia uma notificação no Discord diretamente para o criador e o responsável da tarefa.

---

# 8. Módulo Especial: O "Alto Escalão" (Coordenadores, Gerentes e Diretores)

A liderança possui papel fundamental no direcionamento estratégico e acompanhamento tático da operação.

```
┌───────────────────────────────────────────────────────────────────────┐
│              HIERARQUIA E VISIBILIDADE DE GESTÃO                      │
│                                                                       │
│  [ DIRETOR / GERENTE ] ──> Visão estratégica global e setorial        │
│          │                                                            │
│          ▼                                                            │
│  [ COORDENADOR ]       ──> Gestão operacional da equipe do setor      │
│          │                                                            │
│          ▼                                                            │
│  [ FUNCIONÁRIOS ]      ──> Execução focada de tarefas atribuídas      │
└───────────────────────────────────────────────────────────────────────┘
```

## 8.1 Visão Geral de Liderança
- Coordenadores, Gerentes e Diretores possuem a mesma facilidade de criação e execução de tarefas dos funcionários.
- Possuem acesso exclusivo ao menu **"Minha Equipe"**.

## 8.2 Tela "Minha Equipe" (Visão Departamental)
Ao acessar **Minha Equipe**:
- O gestor visualiza todas as tarefas pertencentes aos colaboradores do seu setor em um único painel consolidado.
- Pode alternar a visualização ou filtrar por colaborador específico, prioridade ou prazo.
- Identifica rapidamente colaboradores sobrecarregados ou com disponibilidade.

## 8.3 Monitoramento de Gargalos e SLA
- **Identificação de Tarefas Travadas**: Monitoramento de cards na coluna *Aguardando* para desatar nós e destravar aprovações.
- **Prevenção de Atrasos**: Acompanhamento dos cards na cor vermelha/alerta de prazo iminente para reatribuição de prioridades antes do vencimento do prazo.

## 8.4 Intervenção e Alinhamento em Tarefas da Equipe
- Líderes podem abrir qualquer tarefa do setor, consultar o histórico de auditoria e inserir **comentários de orientação**.
- A intervenção fica registrada com a tag do cargo do gestor, garantindo clareza e autoridade no direcionamento da demanda.

---

# 9. Central de Notificações Discord e Rotinas

O Bot do Portal opera 24/7 integrado ao banco de dados para garantir que nenhuma mensagem seja perdida.

## 9.1 Eventos Notificados em Tempo Real

| Evento Ocorrido | Destinatário da Mensagem | Conteúdo do Alerta |
|---|---|---|
| **Nova Tarefa Criada** | Responsável | Título, Criador, Prioridade e Prazo |
| **Tarefa Editada** | Responsável | Campo alterado e novo valor |
| **Mudança de Status** | Criador da Tarefa | Novo status (e motivo, se "Aguardando") |
| **Novo Comentário** | Criador e Responsável | Autor e texto do comentário |
| **Código 2FA de Login** | Usuário solicitante | Código de 6 letras para entrada no site |

## 9.2 Resumo Diário Matinal (08:00)
Todos os dias úteis, pontualmente às **08h00**, o bot envia uma mensagem direta personalizada para cada colaborador que possua demandas ativas:
- Quantidade de tarefas **pendentes** para o dia.
- Quantidade de tarefas **em andamento**.
- Lista de tarefas **atrasadas** que necessitam de ação urgente.

---

# 10. Regras de Negócio e Políticas Inegociáveis

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                      DIRETRIZES FUNDAMENTAIS DO PORTAL                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ 1. TAREFAS SÃO IMUTÁVEIS: Nenhuma tarefa pode ser excluída do sistema.    ║
║    Mesmo demandas canceladas devem ser documentadas via status/histórico.║
║                                                                           ║
║ 2. CONCLUSÃO DEFINITIVA: Uma tarefa concluída nunca pode ser reaberta.    ║
║    Caso haja novo trabalho correlato, cria-se uma nova tarefa de follow-up║
║                                                                           ║
║ 3. AUDITORIA TOTAL: Toda ação gera log com IP, data, hora e autor.        ║
║                                                                           ║
║ 4. SIGILO DE ACESSO: Seu PIN de 6 dígitos é individual e intransferível. ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

# 11. Perguntas Frequentes & Resolução de Problemas (FAQ)

### P1: Digitei meu PIN no site e recebi a mensagem "Vincule seu Discord". O que fazer?
> **R**: Você ainda não vinculou seu PIN ao bot do Discord. Abra o Discord, encontre o bot oficial e envie por DM o comando `/vincular SEU_PIN`.

### P2: Não recebi o código de confirmação no Discord ao fazer login.
> **R**: Verifique se as suas Mensagens Diretas (DMs) do Discord estão abertas para receber mensagens de membros do servidor corporativo. Verifique também se não silenciou o bot. Se necessário, aguarde 30 segundos e clique para reenviar o código.

### P3: Posso editar o prazo de uma tarefa depois que ela foi criada?
> **R**: Sim. Abra a tarefa na Sidebar de detalhes, clique no botão de edição e ajuste a nova data/hora. A alteração ficará registrada no Histórico de Auditoria com o seu nome.

### P4: Como faço para excluir uma tarefa que criei por engano?
> **R**: Por diretriz corporativa de auditoria e conformidade, **nenhuma tarefa pode ser deletada**. Se uma tarefa não for mais necessária, mova-a para *Aguardando* com a justificativa *"Cancelada / Criada por engano"* ou finalize-a com essa anotação nos comentários.

### P5: Sou Coordenador e não consigo ver um funcionário recém-contratado na minha equipe.
> **R**: Solicite à equipe de TI/Root que verifique se o usuário foi cadastrado com o `setor_id` correto correspondente ao seu departamento e se o status dele está como `Ativo`.

---
*Manual homologado para uso corporativo em toda a organização.*
