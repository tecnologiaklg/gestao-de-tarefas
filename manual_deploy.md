# 🚀 Manual de Deploy — Gestão de Tarefas

> Stack: Docker + Traefik v2 + Let's Encrypt · PostgreSQL 16 · Node.js 20 · React/Vite

---

## Pré-requisitos na VPS

| Item | Versão mínima |
|---|---|
| Sistema operacional | Ubuntu 22.04 LTS |
| Docker | 24+ |
| Docker Compose plugin | v2.20+ |
| Domínio apontando para o IP da VPS | ex: `tarefas.empresa.com` |
| Portas 80 e 443 liberadas no firewall | |

```bash
# Instalar Docker (Ubuntu)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker
docker --version   # confirmar
```

---

## 1. Configurar Traefik (uma vez só)

O Traefik gerencia HTTPS automaticamente para **todos** os seus serviços.

```bash
mkdir -p /opt/traefik && cd /opt/traefik
```

**`/opt/traefik/docker-compose.yml`**
```yaml
version: "3.8"
services:
  traefik:
    image: traefik:v2.11
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/traefik.yml:ro
      - ./acme.json:/acme.json
    networks:
      - proxy

networks:
  proxy:
    external: true
```

**`/opt/traefik/traefik.yml`**
```yaml
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

providers:
  docker:
    exposedByDefault: false
    network: proxy

certificatesResolvers:
  letsencrypt:
    acme:
      email: seu@email.com          # ← troque
      storage: /acme.json
      httpChallenge:
        entryPoint: web
```

```bash
touch /opt/traefik/acme.json
chmod 600 /opt/traefik/acme.json
docker network create proxy
cd /opt/traefik && docker compose up -d
```

---

## 2. Criar Bot no Discord Developer Portal

1. Acesse [discord.com/developers/applications](https://discord.com/developers/applications)
2. **New Application** → dê um nome (ex: *Portal de Tarefas*)
3. Vá em **Bot** → clique em **Reset Token** → copie o token
4. Em **Privileged Gateway Intents**, ative:
   - ✅ Message Content Intent
   - ✅ Direct Messages
5. Em **OAuth2 → URL Generator**:
   - Scopes: `bot`
   - Bot Permissions: `Send Messages`, `Read Message History`
   - Copie a URL gerada e abra no browser para **convidar o bot para o servidor**

> 💡 Guarde o **Bot Token** — você vai precisar no `.env`

---

## 3. Deploy da Aplicação

### 3.1 Clonar o repositório

```bash
cd /opt
git clone https://github.com/SEU_USUARIO/gestao-tarefas.git
cd gestao-tarefas
```

### 3.2 Configurar variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Preencha **todos** os campos:

```env
# Domínio (sem https://)
DOMAIN=tarefas.empresa.com

# Banco de dados
POSTGRES_DB=gestao_tarefas
POSTGRES_USER=app_user
POSTGRES_PASSWORD=SENHA_FORTE_AQUI

# JWT — gere com: openssl rand -hex 64
JWT_SECRET=SEU_SEGREDO_JWT_LONGO_AQUI
JWT_EXPIRES_IN=8h

# Token Root — gere com: openssl rand -hex 32
ROOT_ADMIN_TOKEN=SEU_TOKEN_ROOT_AQUI

# Token do Bot Discord
DISCORD_TOKEN=SEU_TOKEN_DO_BOT_AQUI
```

> **Dica para gerar segredos:**
> ```bash
> openssl rand -hex 64   # para JWT_SECRET
> openssl rand -hex 32   # para ROOT_ADMIN_TOKEN
> ```

### 3.3 Primeiro deploy

```bash
docker compose up -d --build
```

Aguarde 1-2 minutos (o banco vai rodar as migrations automaticamente).

### 3.4 Verificar

```bash
docker compose ps
# Todos devem aparecer como "running" (db: healthy)

docker compose logs backend --tail=30
# Deve aparecer: [server] Rodando na porta 4000

docker compose logs bot --tail=20
# Deve aparecer: [bot] Conectado como: NomeDoBot#1234
```

Acesse `https://tarefas.empresa.com` — HTTPS já estará funcionando. ✅

---

## 4. CI/CD com GitHub Actions

Crie o arquivo `.github/workflows/deploy.yml` no repositório:

```yaml
name: Deploy na VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/gestao-tarefas
            git pull origin main
            docker compose up -d --build
            docker image prune -f
```

### Configurar Secrets no GitHub

Vá em **Settings → Secrets and variables → Actions** e adicione:

| Secret | Valor |
|---|---|
| `VPS_HOST` | IP ou hostname da VPS |
| `VPS_USER` | Usuário SSH (ex: `root` ou `ubuntu`) |
| `VPS_SSH_KEY` | Conteúdo da chave privada SSH (`~/.ssh/id_rsa`) |

### Gerar chave SSH (se não tiver)

```bash
# Na sua máquina local
ssh-keygen -t ed25519 -C "github-actions"
# Copie a chave pública para a VPS
ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@ip-da-vps
# Adicione o conteúdo de ~/.ssh/id_ed25519 no Secret VPS_SSH_KEY
```

> A partir daí, **todo push na branch `main`** faz o deploy automaticamente. 🎉

---

## 5. Comandos úteis pós-deploy

```bash
# Ver logs em tempo real
docker compose logs -f backend
docker compose logs -f bot

# Reiniciar um serviço
docker compose restart backend

# Atualizar manualmente (sem CI/CD)
git pull && docker compose up -d --build

# Backup do banco
docker compose exec db pg_dump -U app_user gestao_tarefas > backup_$(date +%F).sql

# Restaurar backup
cat backup.sql | docker compose exec -T db psql -U app_user gestao_tarefas

# Ver uso de espaço das imagens
docker system df
docker image prune -f   # limpar imagens antigas
```

---

## 6. Troubleshooting

| Problema | Causa provável | Solução |
|---|---|---|
| Site mostra erro 502 | Backend não iniciou | `docker compose logs backend` |
| HTTPS não funciona | DNS não propagou ainda | Aguarde até 24h ou verifique o A record |
| Bot não responde | Token inválido ou sem intent | Verifique `DISCORD_TOKEN` e os intents no Developer Portal |
| Banco não conecta | `DATABASE_URL` incorreta | Confira `POSTGRES_*` no `.env` |
| Login bloqueado (discord_required) | Usuário sem Discord vinculado | Usuário deve fazer `/vincular` no Discord |
| Código de confirmação não chega | Bot offline ou DM desativada | `docker compose logs bot`, verificar DMs abertas |

---

## 7. Estrutura de arquivos na VPS

```
/opt/gestao-tarefas/
├── .env                    ← variáveis de ambiente (não commitar!)
├── docker-compose.yml      ← orquestração de todos os serviços
├── backend/                ← API Node.js/TypeScript
├── frontend/               ← React + Vite (servido pelo nginx)
├── bot/                    ← Bot Discord TypeScript
└── db/migrations/          ← SQL executado automaticamente na 1ª subida
```
