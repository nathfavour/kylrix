# Self-Hosting Kylrix 🏴

**Take control of your sovereign workspace.**

Kylrix is designed to run anywhere — your hardware, your data, your rules. This guide gets you from zero to a fully running instance in under 10 minutes.

---

## ⚡ Quickstart (3 commands)

```bash
git clone https://github.com/Kylrix/kylrix.git && cd kylrix

make setup        # Interactive wizard — generates .env with secure secrets

make up           # Starts everything: Kylrix + Appwrite + Database + Redis + HTTPS
```

That's it. Open `https://your-domain.com` and create your account.

> **Already have Appwrite?** Use `make app-only` instead of `make up` to run only the Kylrix app + reverse proxy.

---

## 🚀 Prerequisites

| Requirement | Minimum |
|---|---|
| Docker (or Podman) + Compose | v2.20+ |
| RAM | 4 GB |
| Disk | 10 GB |
| Domain (production) | Any domain with DNS pointing to your server |

For local development, `localhost` works out of the box.

---

## 📦 What's in the Stack

The `docker-compose.yml` bundles everything needed for a complete self-hosted deployment:

| Service | Image | Purpose |
|---|---|---|
| **kylrix** | Custom build | The Next.js application |
| **appwrite** | `appwrite/appwrite:1.6` | Backend (auth, database, storage, realtime) |
| **mariadb** | `mariadb:10.11` | Appwrite's SQL database |
| **redis** | `redis:7-alpine` | Appwrite's cache & pub/sub |
| **caddy** | `caddy:2-alpine` | Reverse proxy with automatic HTTPS |

All services include health checks, automatic restart, and persistent volumes.

---

## 🛠️ Step-by-Step Setup

### 1. Clone and Configure

```bash
git clone https://github.com/Kylrix/kylrix.git
cd kylrix
make setup
```

The interactive setup wizard will:
- Check that Docker/Compose is installed
- Ask for your domain, admin email, and optional integrations
- Generate cryptographically secure secrets automatically
- Write a production-ready `.env` file

### 2. Start the Stack

**Full Stack** (includes Appwrite):
```bash
make up
```

**App Only** (bring your own Appwrite):
```bash
make app-only
```

### 3. Set Up Appwrite

After the stack is running:

1. Open the Appwrite console at `https://api.yourdomain.com` (or your configured `APPWRITE_DOMAIN`)
2. Create a new project with the ID shown during setup
3. Add a **Web Platform** with your domain as the hostname
4. Create a **Server API Key** with full access
5. Add the API key to your `.env` as `APPWRITE_API_KEY`

### 4. Provision the Database Schema

```bash
make schema-push
```

This reads `appwrite.config.json` and creates all 4 databases, ~60 tables with columns, indexes, and 14 storage buckets via the Appwrite REST API. It's fully idempotent — safe to re-run.

### 5. Configure Email (for Multi-User)

If you want multiple users collaborating, configure SMTP in your `.env`:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=tls
SMTP_USERNAME=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

For solo use, email setup is optional — verify your account manually in the Appwrite console.

---

## 🔧 Management Commands

```bash
make help           # Show all commands
make status         # Service health dashboard
make logs           # Follow all logs
make logs-kylrix    # Kylrix app logs only
make logs-appwrite  # Appwrite logs only
make restart        # Stop + start all services
make build          # Rebuild the Kylrix image
make backup         # Backup all volumes to ./backups/
make update         # Pull latest, rebuild, restart
make schema-push    # Provision/update Appwrite schema
make shell          # Open a shell in the Kylrix container
make clean          # ⚠️ Nuclear: remove containers + volumes
```

---

## 🛡️ Configuration Reference

### Build-Time Variables
These are baked into the Docker image during build:

| Variable | Description | Default |
|---|---|---|
| `APPWRITE_ENDPOINT` | Appwrite API URL (with `/v1`) | `http://appwrite/v1` |
| `APPWRITE_PROJECT_ID` | Appwrite Project ID | — |
| `DOMAIN` | Base domain for cookies/security | `localhost` |

### Runtime Variables
Set in `.env` — see `env.sample` for the full documented reference.

| Variable | Description |
|---|---|
| `APPWRITE_API` | Server SDK API key |
| `ADMINS` | Admin email(s) |
| `KYLRIX_INTERNAL_JOBS_SECRET` | Internal cron auth (min 32 chars) |
| `GOOGLE_API_KEY` | Gemini AI key (optional) |
| `CLOUDFLARE_TURNSTILE_SECRET` | Bot protection (optional) |
| `TELEGRAM_BOT_API` | Push notifications (optional) |

---

## 🏗️ Architecture

Self-hosting gives you:

- **Zero-Knowledge Security** — All encryption keys are generated in the browser. The server never sees raw data.
- **Sovereign AI Agents** — Your AI agents run on your hardware with your API keys.
- **Data Portability** — Full import/export. Your data is never locked in.
- **Automatic HTTPS** — Caddy handles Let's Encrypt certificates with zero configuration.

---

## 🔍 Troubleshooting

| Issue | Fix |
|---|---|
| CORS errors | Add your domain as a Web Platform in Appwrite Console → Settings → Platforms |
| Auth/cookie failures | Ensure `DOMAIN` matches the browser's address bar domain exactly |
| Build OOM | Ensure at least 4 GB RAM. Next.js + Turbopack builds are resource-intensive |
| Schema push fails | Check `APPWRITE_API_KEY` is set and has full access |
| Appwrite won't start | Check `make logs-appwrite` — usually a MariaDB or Redis connection issue |
| Caddy HTTPS errors | DNS must resolve to your server. For local dev, `localhost` uses self-signed certs |

---

**Welcome to sovereign computing. Stay free.** 🌙
