# 📘 MANUAL DO USUÁRIO & COORDENAÇÃO
## PORTAL CORPORATIVO DE GESTÃO DE TAREFAS

```
================================================================================
Documento Oficial: Manual Operacional do Colaborador e Coordenador
Versão: 1.0 (Edição Corporativa)
Público-Alvo: Funcionários, Coordenadores, Gerentes e Diretores
Sistema: Portal de Tarefas Web + Integração Discord Notifier
Classificação: Uso Interno Confidencial
================================================================================
```

---

# 📑 SUMÁRIO GERAL

1. [1. Visão Geral e Objetivos do Sistema](#secao-1)
2. [2. Primeiro Acesso e Segurança](#secao-2)
   - 2.1 [O PIN Pessoal de 6 Dígitos](#secao-2-1)
   - 2.2 [Vinculação Obrigatória com o Discord (2FA)](#secao-2-2)
3. [3. Autenticação e Sessão](#secao-3)
   - 3.1 [Fluxo de Login com Verificação em Duas Etapas](#secao-3-1)
   - 3.2 [Sessão Persistente e Segurança (Quando o Código é Solicitado)](#secao-3-2)
4. [4. Estrutura da Interface e Navegação](#secao-4)
   - 4.1 [Barra Lateral (Menu de Navegação)](#secao-4-1)
   - 4.2 [Painel Superior de Indicadores (KPIs)](#secao-4-2)
   - 4.3 [Barra de Busca e Filtros Inteligentes](#secao-4-3)
5. [5. Quadro Operacional Kanban](#secao-5)
   - 5.1 [Colunas e Ciclo de Vida da Tarefa](#secao-5-1)
   - 5.2 [Regras Rígidas de Movimentação](#secao-5-2)
   - 5.3 [Pausando Tarefas (Justificativa Obrigatória de "Aguardando")](#secao-5-3)
   - 5.4 [Conclusão Irreversível de Tarefas](#secao-5-4)
6. [6. Criação e Gestão de Tarefas](#secao-6)
   - 6.1 [Criando uma Tarefa "Para Mim" (Pessoal)](#secao-6-1)
   - 6.2 [Criando uma Tarefa "Para Outra Pessoa" (Delegação)](#secao-6-2)
   - 6.3 [Seletores Modernos de Calendário e Horário](#secao-6-3)
   - 6.4 [Matriz Corporativa de Prioridades](#secao-6-4)
7. [7. Painel de Detalhes, Auditoria e Comunicação](#secao-7)
   - 7.1 [Aba "Detalhes" e Metadados](#secao-7-1)
   - 7.2 [Aba "Histórico" (Auditoria Imutável)](#secao-7-2)
   - 7.3 [Aba "Comentários" e Alertas aos Envolvidos](#secao-7-3)
8. [8. Módulo Especial: Coordenadores (Minha Equipe)](#secao-8)
   - 8.1 [Visão Geral de Coordenação](#secao-8-1)
   - 8.2 [Tela "Minha Equipe" (Visão Departamental)](#secao-8-2)
   - 8.3 [Monitoramento de Gargalos e SLA](#secao-8-3)
   - 8.4 [Intervenção e Alinhamento em Tarefas da Equipe](#secao-8-4)
9. [9. Central de Notificações Discord e Rotinas](#secao-9)
   - 9.1 [Eventos Notificados em Tempo Real](#secao-9-1)
   - 9.2 [Resumo Diário Matinal (08:00)](#secao-9-2)
10. [10. Regras de Negócio e Políticas Inegociáveis](#secao-10)
11. [11. Perguntas Frequentes & Resolução de Problemas (FAQ)](#secao-11)

---

<a id="secao-1"></a>
# 1. Visão Geral e Objetivos do Sistema

O **Portal de Gestão de Tarefas** é a plataforma corporativa oficial para registro, execução, delegação e acompanhamento de atividades no ambiente de trabalho.

### Objetivos Principais:
- **Centralização Operacional**: Eliminar a perda de demandas transmitidas verbalmente ou em conversas paralelas.
- **Transparência e Rastreabilidade**: Cada ação no sistema gera histórico auditável com data, hora e autor.
- **Eficiência e Controle de Prazos**: Alertas visuais e notificações diretas evitam atrasos em entregas críticas.
- **Integração Interdepartamental**: Colaboradores de qualquer setor podem registrar demandas para colegas sem fricção burocrática.

---

<a id="secao-2"></a>
# 2. Primeiro Acesso e Segurança

<a id="secao-2-1"></a>
## 2.1 O PIN Pessoal de 6 Dígitos
Cada colaborador recebe da equipe de TI/Root um **PIN exclusivo de 6 dígitos numéricos** (ex: `482910`).
- O PIN é sua credencial pessoal de identificação.
- **Nunca compartilhe seu PIN com colegas.**
- Seu PIN não é exibido em telas públicas, tarefas ou relatórios.

<a id="secao-2-2"></a>
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

<a id="secao-3"></a>
# 3. Autenticação e Sessão

<a id="secao-3-1"></a>
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
[ Acesso Liberado ao Painel Principal com Sessão Gravada no Navegador ]
```

1. Acesse o endereço do Portal de Tarefas no seu navegador.
2. Na tela de login, insira seu **PIN de 6 dígitos**.
3. Clique em **Entrar**.
4. O sistema emitirá um código alfanumérico temporário (ex: `W4F8L2`) diretamente no seu Discord.
5. Digite o código de confirmação no site e clique em **Confirmar Acesso**.

> ⏱️ **Validade do código**: O código de verificação expira em **5 minutos**. Caso expire, basta reiniciar o login para receber um novo.

<a id="secao-3-2"></a>
## 3.2 Sessão Persistente e Segurança (Quando o Código é Solicitado)
Uma vez autenticado, **sua sessão permanece conectada no navegador**. Você **NÃO** precisa digitar seu PIN nem pedir código de verificação no Discord a cada acesso ou no dia a dia.

O sistema só solicitará o PIN e o código 2FA do Discord novamente nos seguintes momentos específicos:
1. **Novo Dispositivo / Notebook**: Ao acessar o sistema por um computador ou aparelho diferente pela primeira vez.
2. **Navegador Diferente**: Ao alternar de navegador (por exemplo, se você costuma usar o Google Chrome e abrir no Microsoft Edge).
3. **Limpeza de Cache / Cookies / Dados**: Se o histórico, cookies ou dados de navegação do browser forem apagados.
4. **Logoff Manual**: Ao clicar expressamente no botão **"Sair"** no menu do portal.

> 💡 **No cotidiano de trabalho**: Basta abrir o endereço do portal no seu navegador habitual e você já estará logado e pronto para operar suas tarefas!

---

<a id="secao-4"></a>
# 4. Estrutura da Interface e Navegação

<a id="secao-4-1"></a>
## 4.1 Barra Lateral (Menu de Navegação)
Localizada à esquerda da tela, oferece acesso rápido aos módulos disponíveis de acordo com seu perfil:
- 📌 **Tarefas**: Visualização padrão de atividades organizadas em duas abas:
  - **Minhas Tarefas**: Reúne todas as tarefas que você deve executar (demandas atribuídas a você por colegas e suas tarefas pessoais de auto-organização).
  - **Criadas por Mim**: Reúne exclusivamente as tarefas que você delegou para outros colegas acompanharem e executarem.
- 👥 **Minha Equipe**: Disponível exclusivamente para **Coordenadores**, exibindo o painel consolidado do departamento.
- 🌓 **Alternador de Tema**: Alternância entre Modo Claro e Modo Escuro calibrado.
- 🚪 **Sair**: Encerra sua sessão com segurança.

<a id="secao-4-2"></a>
## 4.2 Painel Superior de Indicadores (KPIs)
Cards informativos no topo da tela refletem sua carga de trabalho em tempo real:
- 📋 **Total**: Quantidade geral de tarefas sob seu escopo.
- ⚡ **Em Andamento**: Demandas que estão sendo executadas no momento.
- ⏸️ **Aguardando**: Demandas pausadas por dependências externas.
- 🚨 **Atrasadas**: Tarefas cujo prazo limite foi ultrapassado e exigem atenção prioritária.
- ✅ **Concluídas (7d)**: Volume de entregas finalizadas nos últimos 7 dias.

<a id="secao-4-3"></a>
## 4.3 Barra de Busca e Filtros Inteligentes
Localizada logo abaixo das abas de perspectiva:
- 🔍 **Busca por Texto**: Filtra cards em tempo real pelo título da tarefa.
- 🚩 **Filtro de Prioridade**: Dropdown com opções *Todas prioridades, Baixa, Normal e Urgente*.
- 📅 **Filtro por Prazo**: Campo de data nativo para localizar tarefas com vencimento específico.
- ✕ **Limpar Filtros**: Botão visível automaticamente quando há filtros ativos para restaurar a visualização completa.

---

<a id="secao-5"></a>
# 5. Quadro Operacional Kanban

O trabalho é gerenciado visualmente através de um quadro Kanban organizado em 4 colunas sequenciais:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PENDENTE    │───>│ EM ANDAMENTO │<──>│  AGUARDANDO  │───>│  CONCLUÍDA   │
│  (A iniciar) │    │  (Em ação)   │    │  (Pausada)   │    │  (Finalizada)│
│              │    │              │    │              │    │(Irreversível)│
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

<a id="secao-5-1"></a>
## 5.1 Colunas e Ciclo de Vida da Tarefa
1. **Pendente (📭)**: Tarefa atribuída e registrada no sistema, aguardando início dos trabalhos.
2. **Em Andamento (⚡)**: Colaborador iniciou ativamente a execução da demanda.
3. **Aguardando (⏸️)**: Trabalho pausado temporariamente devido a bloqueios externos (ex: retorno de cliente, aprovação de diretoria, peças).
4. **Concluída (✅)**: Atividade totalmente finalizada e entregue.

<a id="secao-5-2"></a>
## 5.2 Regras Rígidas de Movimentação
O sistema valida a conformidade de cada transição via *Drag & Drop*:

| Origem | Destino | Permitido? | Condição / Observação |
|---|---|:---:|---|
| **Pendente** | **Em Andamento** | ✅ Sim | Solicita confirmação de segurança antes de iniciar |
| **Pendente** | **Aguardando** | ✅ Sim | Exige preenchimento de justificativa obrigatória |
| **Em Andamento** | **Aguardando** | ✅ Sim | Exige preenchimento de justificativa obrigatória |
| **Em Andamento** | **Concluída** | ✅ Sim | Solicita confirmação de segurança (ação irreversível) |
| **Aguardando** | **Em Andamento** | ✅ Sim | Solicita confirmação de retomada dos trabalhos |
| **Aguardando** | **Concluída** | ✅ Sim | Solicita confirmação de finalização definitiva |
| **Concluída** | *Qualquer coluna* | ❌ Não | **Irreversível.** Não pode ser reaberta |

<a id="secao-5-3"></a>
## 5.3 Confirmação de Segurança e Justificativa de Pausa
Para evitar alterações acidentais de status ao manusear o quadro:
- **Ao mover para "Em Andamento" ou "Concluída"**: O sistema abre um modal de confirmação de segurança exibindo o título da tarefa.
- **Ao mover para "Aguardando"**: O sistema solicita obrigatoriamente a descrição do motivo do bloqueio (ex: *"Aguardando aprovação do orçamento pelo financeiro"*). A justificativa é gravada no Histórico de Auditoria e informada aos envolvidos.

<a id="secao-5-4"></a>
## 5.4 Conclusão Irreversível de Tarefas
Quando uma tarefa é movida para **Concluída**:
- O card é travado permanentemente para edição de dados.
- O campo de comentários é encerrado para novas mensagens.
- O criador da tarefa recebe notificação imediata no Discord.

---

<a id="secao-6"></a>
# 6. Criação e Gestão de Tarefas

Para registrar uma nova atividade, clique no botão **＋ Nova Tarefa** no topo direito da tela. Uma janela interativa perguntará a finalidade:

```
┌────────────────────────────────────────────────────────────┐
│                  Essa tarefa é para quem?                  │
│                                                            │
│    ┌──────────────────────┐    ┌──────────────────────┐    │
│    │       PARA MIM       │    │  PARA OUTRA PESSOA   │    │
│    │ (Organização própria)│    │  (Delegar a colega)  │    │
│    └──────────────────────┘    └──────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

<a id="secao-6-1"></a>
## 6.1 Criando uma Tarefa "Para Mim" (Pessoal)
- Selecione **Para mim**.
- O sistema preenche seu Setor e seu Nome como Responsável automaticamente nos bastidores, mantendo o formulário enxuto.
- Informe apenas: **Título**, **Descrição** (opcional), **Prioridade**, **Data** e **Horário de Entrega**.
- Essa tarefa aparecerá exclusivamente na sua aba **Minhas Tarefas** identificada pela etiqueta azul *Minha Tarefa (Pessoal)*.

<a id="secao-6-2"></a>
## 6.2 Criando uma Tarefa "Para Outra Pessoa" (Delegação)
- Selecione **Para outra pessoa**.
- Escolha o **Setor de Destino** e o **Responsável** daquele setor.
- Preencha o **Título**, a **Descrição detalhada**, o nível de **Prioridade** e o **Prazo (Data e Hora)**.
- Essa tarefa aparecerá na sua aba **Criadas por Mim** identificada pela etiqueta *Para: [Nome do Colega]*, e aparecerá no painel do responsável em *Minhas Tarefas*.

<a id="secao-6-3"></a>
## 6.3 Seletores Modernos de Data e Horário de Entrega
O sistema utiliza seletores corporativos modernos com localização nativa em Português (`pt-BR`):
- **Data de Entrega**: Calendário interativo inteligente, com navegação de meses, indicação do dia atual e formato `DD/MM/AAAA`.
- **Horário de Entrega**: Seletor de hora com formato 24 horas (`HH:MM`).
- Os campos contam com ícones ilustrativos, controle dinâmico de posicionamento na tela e suporte completo ao Modo Claro e Modo Escuro.

<a id="secao-6-4"></a>
## 6.4 Matriz Corporativa de Prioridades

| Nível | Identificação Visual | Quando Utilizar | Exemplo Prático |
|---|:---:|---|---|
| 🟢 **Baixa** | Tag Verde | Atividades rotineiras sem impacto imediato caso postergadas | Organização de arquivos internos, atualização de planilhas de apoio |
| 🔵 **Normal** | Tag Azul | Fluxo operacional diário padrão com prazo acordado | Envio de relatório semanal, cotação de insumos, resposta a ticket |
| 🔴 **Urgente** | Tag Vermelha | Risco iminente de perda financeira, operacional ou legal | Servidor inoperante, prazo judicial/fiscal vencendo hoje |

---

<a id="secao-7"></a>
# 7. Painel de Detalhes, Auditoria e Comunicação

Ao clicar em qualquer card do Kanban, abre-se a **Sidebar Lateral Direita** contendo as abas principais:

<a id="secao-7-1"></a>
## 7.1 Aba "Detalhes" e Metadados
- Título e Descrição completa da demanda.
- Nome do Criador e do Responsável com seus respectivos avatares e setores.
- Prazo final e badge de status atualizado.
- Botão de edição rápida (disponível para os envolvidos enquanto a tarefa não estiver concluída).

<a id="secao-7-2"></a>
## 7.2 Aba "Histórico" (Auditoria Imutável)
Uma linha do tempo cronológica com carimbo de data, hora e responsável por cada evento:
- Data e hora exata da criação da tarefa.
- Todas as alterações de status (incluindo as justificativas de pausa).
- Alterações em títulos, prazos ou prioridades.
- Nenhuma entrada do histórico pode ser editada ou deletada.

<a id="secao-7-3"></a>
## 7.3 Aba "Comentários" e Alertas aos Envolvidos
- Chat interno atrelado à tarefa para alinhamento rápido de dúvidas, links ou atualizações de progresso.
- Cada novo comentário envia uma notificação no Discord diretamente para os demais envolvidos na tarefa.

---

<a id="secao-8"></a>
# 8. Módulo Especial: Coordenadores (Minha Equipe)

O módulo **Minha Equipe** é um recurso exclusivo disponível para colaboradores com cargo de **Coordenador**, permitindo a gestão tática do setor.

<a id="secao-8-1"></a>
## 8.1 Visão Geral de Coordenação
- Coordenadores possuem todas as funcionalidades dos funcionários (criação e execução de tarefas).
- Possuem acesso exclusivo ao menu **"Minha Equipe"** na barra lateral.

<a id="secao-8-2"></a>
## 8.2 Tela "Minha Equipe" (Visão Departamental)
Ao acessar **Minha Equipe**:
- O coordenador visualiza todas as tarefas pertencentes aos colaboradores do seu setor em um único painel consolidado.
- Pode alternar a visualização ou filtrar por colaborador específico, prioridade ou prazo.
- Identifica rapidamente colaboradores sobrecarregados ou com disponibilidade.

<a id="secao-8-3"></a>
## 8.3 Monitoramento de Gargalos e SLA
- **Identificação de Tarefas Travadas**: Monitoramento de cards na coluna *Aguardando* para desatar nós e destravar aprovações.
- **Prevenção de Atrasos**: Acompanhamento dos cards na cor vermelha/alerta de prazo iminente para reatribuição de prioridades antes do vencimento do prazo.

<a id="secao-8-4"></a>
## 8.4 Intervenção e Alinhamento em Tarefas da Equipe
- O coordenador pode abrir qualquer tarefa do setor, consultar o histórico de auditoria e inserir **comentários de orientação**.
- A intervenção fica registrada com a tag do cargo de Coordenador, garantindo clareza e autoridade no direcionamento da demanda.

---

<a id="secao-9"></a>
# 9. Central de Notificações Discord e Rotinas

O Bot do Portal opera 24/7 integrado ao banco de dados para garantir comunicação instantânea e rastreabilidade:

<a id="secao-9-1"></a>
## 9.1 Eventos Notificados em Tempo Real

| Evento Ocorrido | Destinatário da Mensagem | Conteúdo do Alerta |
|---|---|---|
| **Nova Tarefa Criada** | Responsável | Título, Criador, Prioridade e Prazo |
| **Tarefa Editada** | Responsável | Campo alterado e novo valor |
| **Mudança de Status** | Criador da Tarefa *(exceto se foi ele próprio que alterou)* | Novo status formatado (`Pendente`, `Em Andamento`, `Aguardando`, `Concluída`) e justificativa |
| **Novo Comentário** | Demais envolvidos | Autor e texto do comentário |
| **Código 2FA de Login** | Usuário solicitante | Código de 6 letras para entrada no site |

<a id="secao-9-2"></a>
## 9.2 Resumo Diário Matinal (08:00)
Todos os dias úteis, pontualmente às **08h00** (horário de Brasília), o bot envia uma mensagem direta para **todos os colaboradores vinculados**:
- Quantidade de tarefas **abertas e pendentes** para o dia.
- Quantidade de tarefas **em andamento**.
- Quantidade de tarefas **aguardando**.
- Lista de tarefas **atrasadas** que necessitam de ação urgente.

---

<a id="secao-10"></a>
# 10. Regras de Negócio e Políticas Inegociáveis

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                      DIRETRIZES FUNDAMENTAIS DO PORTAL                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║ 1. TAREFAS SÃO IMUTÁVEIS: Nenhuma tarefa pode ser excluída do sistema.    ║
║    Mesmo demandas canceladas devem ser documentadas via status/histórico. ║
║                                                                           ║
║ 2. CONCLUSÃO DEFINITIVA: Uma tarefa concluída nunca pode ser reaberta.    ║
║    Caso haja novo trabalho correlato, cria-se uma nova tarefa de follow-up║
║                                                                           ║
║ 3. AUDITORIA TOTAL: Toda ação gera log com IP, data, hora e autor.        ║
║                                                                           ║
║ 4. SIGILO DE ACESSO: Seu PIN de 6 dígitos é individual e intransferível.  ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

<a id="secao-11"></a>
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
