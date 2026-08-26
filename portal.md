# Especificação Técnica — Portal Interno de Tarefas

## 1. Objetivo

Desenvolver um portal interno para controle de tarefas entre colaboradores da empresa.

Qualquer usuário poderá criar uma tarefa para outro usuário, independentemente de setor ou cargo.

O objetivo é registrar atividades que precisam ser realizadas, evitando que tarefas cotidianas sejam esquecidas.

O acompanhamento operacional será realizado principalmente através de um quadro **Kanban**, no qual as tarefas serão movimentadas entre seus respectivos status.---

# 2. Stack tecnológica

## Frontend

**React**

Responsável por:

* interface;
* sidebar;
* telas;
* Kanban;
* cards;
* filtros;
* KPIs;
* formulários;
* pop-ups;
* sidebar de detalhes da tarefa;
* interação do usuário.

## Backend

**Node.js**

Responsável por:

* autenticação;
* regras de negócio;
* permissões;
* CRUD permitido;
* movimentação das tarefas;
* cálculos dos KPIs;
* geração dos logs;
* histórico;
* integração com Discord;
* validações;
* comunicação com PostgreSQL.

## Banco de dados

**PostgreSQL**

Responsável pela persistência de:

* usuários;
* setores;
* tarefas;
* histórico das tarefas;
* comentários;
* logs;
* vínculo com Discord.

## Infraestrutura

**Docker**

A aplicação será executada através de containers.

Estrutura:

* frontend React;
* backend Node.js;
* PostgreSQL;
* bot do Discord.

---

# 3. Tipos de usuário

Existirão:

* Root;
* Diretor;
* Gerente;
* Coordenador;
* Funcionário.

A hierarquia empresarial não limitará quem pode criar tarefas.

Diretor, Gerente, Coordenador e Funcionário poderão criar tarefas para qualquer outro usuário ativo do sistema.

**Nenhum usuário poderá criar uma tarefa para si mesmo.**

---

# 4. PIN / Token dos usuários

Para os usuários normais, **PIN e token representam a mesma informação**.

Cada usuário possuirá um PIN/token de **6 dígitos**.

Esse PIN será:

* gerado pelo sistema;
* único;
* associado a somente um usuário;
* utilizado para login;
* utilizado para vinculação da conta com o bot do Discord;
* armazenado no banco de dados;
* não exibido para outros usuários.

Relação obrigatória:

**1 usuário = 1 PIN/token**

**1 PIN/token = 1 usuário**

---

# 5. Login dos usuários

O acesso normal ao sistema será feito exclusivamente através do PIN.

Não haverá necessidade de informar nome de usuário e senha.

Fluxo:

1. usuário acessa a aplicação;
2. informa seu PIN de 6 dígitos;
3. frontend envia o PIN ao backend;
4. backend consulta o PostgreSQL;
5. identifica o usuário associado;
6. verifica se o usuário está ativo;
7. se estiver ativo, libera a conta correspondente;
8. se estiver inativo, impede o acesso.

O PIN não deverá aparecer:

* em cards;
* em tarefas;
* na seleção de responsáveis;
* para outros colaboradores;
* em informações públicas da aplicação.

---

# 6. Login do Root

O root será uma exceção ao sistema normal de PIN.

O código inicial reservado será:

**000000**

Fluxo:

1. usuário informa `000000` na tela de login;
2. backend identifica uma tentativa de acesso ao root;
3. sistema abre um pop-up;
4. solicita o **token administrativo do root**;
5. backend valida o token informado;
6. o valor esperado estará armazenado na `.env`;
7. se o token estiver correto, o root entra no sistema;
8. se estiver incorreto, o acesso é negado.

O token administrativo do root:

* é diferente do PIN/token dos usuários normais;
* existe exclusivamente para proteção do acesso root;
* fica armazenado na `.env`;
* somente poderá ser alterado através do ambiente do servidor.

Portanto:

**Usuário normal → PIN/token de 6 dígitos**

**Root → 000000 + token administrativo da `.env`**

---

# 7. Root

O root será o administrador geral da aplicação.

Nenhuma tarefa poderá ser destinada ao root.

O root poderá visualizar todas as tarefas do sistema.

Entretanto, não poderá:

* criar tarefa;
* editar tarefa;
* movimentar tarefa;
* comentar em tarefa;
* excluir tarefa.

O root possuirá três áreas principais:

* Logs;
* Equipes;
* Usuários.

---

# 8. Logs

Toda ação relevante deverá gerar registro no sistema.

O log deverá guardar:

* usuário responsável;
* tipo do evento;
* data;
* hora;
* descrição do ocorrido;
* informação anterior, quando aplicável;
* informação nova, quando aplicável.

Eventos registrados incluem:

* acesso ao sistema;
* criação de tarefa;
* alteração de tarefa;
* mudança de status;
* comentário;
* outras modificações realizadas na tarefa.

Na tela do root deverá ser possível filtrar por:

* usuário;
* tipo de ação.

---

# 9. Setores

Os setores serão entidades reais armazenadas no banco.

A tela **Equipes** será utilizada para controle desses setores.

Cada setor será exibido através de um card contendo:

* nome do setor;
* quantidade de membros;
* coordenadores daquele setor.

Deverá ser possível editar os setores.

Poderão existir vários coordenadores dentro do mesmo setor.

Todos os coordenadores daquele setor possuirão acesso às tarefas destinadas aos funcionários daquele setor.

---

# 10. Direção e Gerência como setores

**Direção** e **Gerência** existirão como setores reais no banco.

Entretanto:

* Direção não terá coordenadores;
* Direção não terá funcionários;
* Gerência não terá coordenadores;
* Gerência não terá funcionários.

Esses setores serão utilizados normalmente na identificação e seleção dos usuários.

---

# 11. Tela de Usuários

A área de usuários será administrativa e ficará disponível ao root.

Para cada usuário deverão aparecer:

* nome;
* cargo;
* setor;
* situação ativo/inativo;
* situação do vínculo com Discord.

Discord:

* **Vinculado**
* **Não vinculado**

O PIN/token do usuário não deverá ficar visível nessa listagem.

---

# 12. Usuários inativos

Usuário inativo:

* não poderá fazer login;
* não poderá criar tarefas;
* não poderá receber novas tarefas;
* não poderá interagir no sistema;
* não aparecerá como opção para receber novas tarefas.

Entretanto, continuará aparecendo na tela administrativa do root identificado como **Inativo**.

O usuário poderá posteriormente ser ativado novamente.

Não será permitido desativar um usuário enquanto ele possuir pelo menos uma tarefa que ainda não esteja concluída.

O backend deverá bloquear a operação e informar o motivo.

---

# 13. Navegação

Diretor, Gerente e Funcionário possuirão:

## Meu Trabalho

* Minhas Tarefas
* Criadas por Mim

O Coordenador possuirá:

## Meu Trabalho

* Minhas Tarefas
* Criadas por Mim

## Organização

* Minha Equipe

---

# 14. Minhas Tarefas

Representa as tarefas destinadas ao usuário logado.

A tela possuirá:

* 4 KPI Cards;
* filtros;
* Kanban.

Não terá botão de criação de tarefa.

---

# 15. Criadas por Mim

Representa todas as tarefas criadas pelo usuário logado.

A tela possuirá:

* 4 KPI Cards;
* filtros;
* Kanban;
* botão **+ NOVA TAREFA**.

---

# 16. KPIs

Existirão exatamente **4 KPI Cards**.

## Abertas

Todas as tarefas que não estejam concluídas.

Inclui:

* PENDENTE;
* EM ANDAMENTO;
* AGUARDANDO.

## Atrasadas

Quantidade de tarefas não concluídas cujo prazo já tenha sido ultrapassado.

O cálculo deverá ser realizado pelo backend.

## Concluídas nos últimos 7 dias

Quantidade de tarefas concluídas nos últimos 7 dias.

## Em andamento

Quantidade total de tarefas nos status:

* EM ANDAMENTO;
* AGUARDANDO.

Todos os cálculos deverão ser realizados pelo backend.

---

# 17. Filtros

Nas telas de tarefas existirão:

* busca pelo nome/título;
* filtro por prioridade;
* filtro por prazo;
* ordenação pelas tarefas criadas mais recentemente.

---

# 18. Status

Toda tarefa possuirá um dos quatro status:

### PENDENTE

Tarefa ainda não iniciada.

### EM ANDAMENTO

Tarefa em execução.

### AGUARDANDO

Tarefa que depende de algum fator externo.

Ao entrar neste status será obrigatório informar:

**Motivo**

### CONCLUÍDA

Tarefa finalizada.

---

# 19. Fluxo do Kanban

A movimentação do status ocorrerá exclusivamente através do Kanban.

Não existirão botões de alteração de status dentro da sidebar da tarefa.

Regras:

* tarefa iniciada não poderá voltar para PENDENTE;
* tarefa em AGUARDANDO não poderá voltar para PENDENTE;
* entrada em AGUARDANDO exige motivo;
* tarefa CONCLUÍDA não poderá retornar para nenhum outro status.

---

# 20. Responsável pela mudança de status

A pessoa responsável pela execução da tarefa poderá movimentá-la através do Kanban.

O responsável poderá:

* alterar o status através do Kanban;
* comentar.

O responsável não poderá alterar os dados cadastrados da tarefa.

---

# 21. Prioridades

Toda tarefa possuirá uma das três prioridades:

| Prioridade  | Quando usar                                                                                                          | Exemplos                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Baixa**   | Pode esperar sem gerar prejuízo, bloqueio ou atraso relevante. Não tem prazo próximo.                                | Organizar arquivos, melhorar documentação, ajuste visual, tarefa interna sem data crítica.                    |
| **Normal**  | Precisa ser feita dentro do fluxo normal de trabalho. Tem importância, mas não exige interrupção das outras tarefas. | Cadastro de informação, relatório da semana, cotação com prazo de alguns dias, manutenção planejada.          |
| **Urgente** | Precisa de ação rápida porque existe prazo imediato, bloqueio de outra pessoa/processo ou risco/prejuízo real.       | Sistema parado, cliente aguardando para faturamento, documento vencendo hoje, equipamento impedindo operação. |

---

# 22. Manual de prioridade

Ao lado do campo **Prioridade** deverá existir um botão de ajuda.

Ao clicar nesse botão será aberto um pop-up explicativo.

## Baixa

Pode esperar sem gerar prejuízo, bloqueio ou atraso relevante. Não tem prazo próximo.

Exemplos:

* organizar arquivos;
* melhorar documentação;
* ajuste visual;
* tarefa interna sem data crítica.

## Normal

Precisa ser feita dentro do fluxo normal de trabalho. Tem importância, mas não exige interrupção das outras tarefas.

Exemplos:

* cadastro de informação;
* relatório da semana;
* cotação com prazo de alguns dias;
* manutenção planejada.

## Urgente

Precisa de ação rápida porque existe prazo imediato, bloqueio de outra pessoa/processo ou risco/prejuízo real.

Exemplos:

* sistema parado;
* cliente aguardando para faturamento;
* documento vencendo hoje;
* equipamento impedindo operação.

O pop-up terá função apenas informativa.

---

# 23. Prazo

Toda tarefa obrigatoriamente possuirá:

* data de entrega;
* hora de entrega.

Não será permitido criar uma tarefa sem ambos.

---

# 24. Tarefa atrasada

O cálculo será feito pelo backend.

Uma tarefa será considerada atrasada quando:

**data/hora atual > data/hora do prazo**

e

**status != CONCLUÍDA**

Quando isso ocorrer, deverá aparecer visualmente a indicação:

**ATRASADA**

---

# 25. Criação da tarefa

Campos:

* título;
* descrição;
* setor;
* responsável;
* prioridade;
* data de entrega;
* hora de entrega.

Todos são obrigatórios.

Ao selecionar o setor, deverão aparecer apenas usuários ativos pertencentes àquele setor.

Na seleção aparecerá somente o nome do colaborador.

O PIN/token nunca deverá ser exibido.

O próprio criador deverá ser removido das opções disponíveis, pois ninguém pode criar tarefa para si mesmo.

---

# 26. Confirmação de criação

Antes de finalizar a criação, o sistema deverá avisar que:

**A tarefa não poderá ser excluída após sua criação.**

O usuário deverá confirmar.

Somente então a tarefa será registrada.

---

# 27. Exclusão

Nenhuma tarefa poderá ser apagada.

Isso se aplica a:

* criador;
* responsável;
* coordenador;
* root.

Toda tarefa continuará armazenada no banco de dados.

---

# 28. Alteração da tarefa

Somente o **criador da tarefa** poderá alterar seus dados.

Enquanto não estiver concluída, o criador poderá alterar:

* título;
* descrição;
* setor;
* responsável;
* prioridade;
* data;
* hora.

Toda alteração deverá registrar:

* tarefa;
* usuário;
* data;
* hora;
* campo alterado;
* valor anterior;
* valor novo.

Toda alteração permanecerá salva no banco.

---

# 29. Tarefa concluída

Depois que uma tarefa for concluída, ela ficará totalmente bloqueada.

Não poderá:

* alterar título;
* alterar descrição;
* alterar setor;
* alterar responsável;
* alterar prioridade;
* alterar prazo;
* alterar status;
* adicionar comentários.

A tarefa continuará disponível apenas para consulta.

---

# 30. Histórico da tarefa

Cada tarefa terá histórico permanente.

O histórico deverá incluir:

* criação;
* alteração dos dados;
* mudança de prioridade;
* mudança de responsável;
* mudança de setor;
* alteração de prazo;
* mudança de status;
* entrada em AGUARDANDO;
* motivo do AGUARDANDO;
* comentários.

Quando aplicável deverá mostrar:

**Antes → Depois**

---

# 31. Kanban

O Kanban possuirá:

* PENDENTE;
* EM ANDAMENTO;
* AGUARDANDO;
* CONCLUÍDA.

A mudança ocorrerá através de drag-and-drop.

Ao arrastar para **AGUARDANDO**, deverá ser solicitado o motivo.

Sem motivo, a mudança não será concluída.

Caso uma coluna esteja vazia deverá aparecer uma informação indicando que não existem tarefas naquela etapa.

---

# 32. Concluídas

No Kanban aparecerão somente tarefas concluídas nos últimos **7 dias**.

As tarefas concluídas anteriormente continuarão armazenadas no PostgreSQL.

---

# 33. Card — Minhas Tarefas

Deverá apresentar:

* título;
* quem enviou;
* setor;
* prioridade;
* indicação de atraso.

---

# 34. Card — Criadas por Mim

Deverá apresentar:

* título;
* responsável;
* setor;
* prioridade;
* indicação de atraso.

---

# 35. Sidebar de detalhes

Ao clicar em qualquer card será aberta uma **sidebar à direita, estilo Jira**.

Não será utilizado pop-up central para detalhes da tarefa.

A sidebar deverá apresentar:

* título;
* descrição;
* status;
* prioridade;
* setor;
* criador;
* responsável;
* data e hora do prazo;
* indicação de atraso;
* histórico;
* motivos de AGUARDANDO;
* comentários.

---

# 36. Comentários

Comentários não representam edição dos dados da tarefa.

## Tarefa destinada a Funcionário

Podem comentar:

* quem criou;
* funcionário responsável;
* coordenadores do setor do funcionário.

## Tarefa destinada a Coordenador

Podem comentar:

* quem criou;
* coordenador responsável.

## Tarefa destinada a Gerente

Podem comentar:

* quem criou;
* gerente responsável.

## Tarefa destinada a Diretor

Podem comentar:

* quem criou;
* diretor responsável.

---

# 37. Onde cada usuário comenta

## Criador

Através da sidebar aberta em:

**Criadas por Mim**

## Responsável

Através da sidebar aberta em:

**Minhas Tarefas**

## Coordenador

Através da sidebar aberta em:

**Organização → Minha Equipe**

---

# 38. Minha Equipe

Disponível somente para coordenadores.

O coordenador visualizará tarefas destinadas aos **Funcionários do seu setor**.

Se existirem vários coordenadores no mesmo setor, todos terão acesso.

Não aparecerão:

* tarefas destinadas aos próprios coordenadores;
* tarefas dos funcionários enviadas para outras pessoas;
* tarefas de outros setores.

O objetivo é acompanhar as tarefas que os funcionários daquele setor precisam executar.

---

# 39. Informações de Minha Equipe

A tela deverá apresentar as quantidades das tarefas da equipe por situação.

Também existirá uma listagem contendo:

* prioridade;
* nome da tarefa;
* quem criou;
* responsável;
* situação atual;
* data e hora de entrega.

Ao clicar na tarefa será aberta a sidebar de detalhes.

---

# 40. Permissões

| Ação              | Root | Criador | Responsável |                           Coordenador do setor |
| ----------------- | ---: | ------: | ----------: | ---------------------------------------------: |
| Visualizar tarefa |  Sim |     Sim |         Sim | Sim, quando for tarefa de funcionário do setor |
| Criar tarefa      |  Não |     Sim |         Sim |                                            Sim |
| Excluir           |  Não |     Não |         Não |                                            Não |
| Editar dados      |  Não |     Sim |         Não |                                            Não |
| Alterar status    |  Não |     Não |         Sim |                                            Não |
| Comentar          |  Não |     Sim |         Sim |                               Quando permitido |
| Ver histórico     |  Sim |     Sim |         Sim |                          Quando possuir acesso |

---

# 41. Bot do Discord

O bot ficará rodando no servidor.

Será integrado ao backend Node.js.

O banco deverá armazenar se cada usuário:

* possui Discord vinculado;
* não possui Discord vinculado.

---

# 42. Vinculação do Discord

O **PIN/token do usuário será utilizado para vincular sua conta do sistema ao Discord**.

Fluxo:

1. usuário inicia a interação com o bot;
2. bot solicita o PIN/token de 6 dígitos;
3. usuário informa o código;
4. backend consulta o PostgreSQL;
5. identifica o usuário correspondente;
6. verifica se o PIN é válido;
7. vincula o usuário do Discord ao usuário do sistema;
8. registra que a conta está vinculada.

Regra:

**1 PIN/token → 1 usuário**

**1 usuário → 1 vínculo Discord**

O token administrativo do root **não participa desse processo**.

---

# 43. Primeiro resumo após vínculo

Assim que a conta Discord for vinculada, o usuário receberá um resumo da situação atual de suas tarefas.

---

# 44. Notificação de criação

Quando uma tarefa for criada:

## Criador

Receberá confirmação da criação com os detalhes.

## Responsável

Receberá uma mensagem informando que uma nova tarefa foi destinada a ele.

---

# 45. Alteração dos dados

Quando o criador alterar algum dado da tarefa, o responsável deverá ser notificado.

A mensagem deverá informar:

* campo alterado;
* valor anterior;
* valor novo.

---

# 46. Mudança de status

Quando o responsável alterar o status da tarefa através do Kanban:

**o criador será notificado.**

O responsável não será notificado sobre uma alteração de status feita por ele próprio.

Exemplo:

**EM ANDAMENTO → AGUARDANDO**

Nesse caso também deverá ser enviado ao criador o motivo informado.

---

# 47. Comentários

Comentários deverão gerar:

* registro no banco;
* histórico da tarefa;
* log;
* notificação aos envolvidos que possuem acesso àquele comentário.

---

# 48. Evitar spam

O Discord não deverá simplesmente repetir toda ação que o próprio usuário acabou de realizar.

Exemplo:

se o responsável movimentou sua própria tarefa no Kanban, não precisa receber uma mensagem avisando que ele acabou de movimentá-la.

Nesse caso, quem recebe a notificação é o criador.

---

# 49. Resumo diário

Todos os dias às **08:00**, o bot enviará um resumo das tarefas do usuário.

O resumo deverá utilizar os mesmos quatro indicadores:

* abertas;
* atrasadas;
* concluídas nos últimos 7 dias;
* em andamento.

---

# 50. Estrutura mínima do PostgreSQL

## usuarios

Deverá armazenar:

* ID;
* nome;
* PIN/token;
* cargo;
* setor;
* ativo/inativo;
* identificação do Discord;
* situação do vínculo Discord.

## setores

Deverá armazenar:

* ID;
* nome.

## tarefas

Deverá armazenar:

* ID;
* título;
* descrição;
* criador;
* responsável;
* setor;
* prioridade;
* status;
* data/hora do prazo;
* data/hora da criação;
* data/hora da conclusão.

## historico_tarefas

Deverá armazenar:

* tarefa;
* usuário;
* tipo de alteração;
* valor anterior;
* valor novo;
* data/hora.

## comentarios

Deverá armazenar:

* tarefa;
* autor;
* conteúdo;
* data/hora.

## logs

Deverá armazenar:

* usuário;
* tipo do evento;
* descrição;
* data/hora.

## discord_vinculos

Deverá relacionar:

* usuário do sistema;
* usuário Discord;
* situação do vínculo.

---

# 51. Valores fixos

## Cargos

* DIRETOR
* GERENTE
* COORDENADOR
* FUNCIONÁRIO

## Prioridades

* BAIXA
* NORMAL
* URGENTE

## Status

* PENDENTE
* EM_ANDAMENTO
* AGUARDANDO
* CONCLUIDA

---

# 52. Regras obrigatórias no backend

O backend Node.js deverá validar:

* PIN/token;
* usuário ativo;
* acesso root;
* token administrativo do root;
* criação de tarefa para si mesmo;
* responsável ativo;
* setor;
* data obrigatória;
* hora obrigatória;
* prioridade;
* status;
* movimentação permitida;
* motivo obrigatório ao entrar em AGUARDANDO;
* bloqueio de tarefa concluída;
* impossibilidade de exclusão;
* permissão de edição;
* permissão de comentário;
* acesso de coordenadores;
* desativação de usuário;
* cálculo de atraso;
* KPIs.

O React não será a fonte de verdade para permissões e regras de negócio.

---

# 53. Fluxo das alterações

Toda operação deverá seguir:

**React → Node.js → validação das regras → PostgreSQL → histórico/log → Discord quando aplicável**

Nenhuma alteração deverá existir somente no frontend.

---

# 54. Regra de integridade

Uma tarefa:

* nunca poderá ser apagada;
* terá suas alterações registradas;
* terá histórico permanente;
* ficará bloqueada depois de concluída.

---

# 55. Regra final de autenticação

Para evitar ambiguidade de nomenclatura:

### Usuário normal

**PIN = Token do usuário**

Código único de 6 dígitos utilizado para:

* login;
* identificação da conta;
* vínculo com Discord.

### Root

Primeiro informa:

**000000**

Depois informa:

**token administrativo do root**

Esse segundo token:

* não é PIN de usuário;
* não pertence a uma conta comum;
* fica salvo na `.env`;
* serve exclusivamente para proteger o acesso administrativo.
