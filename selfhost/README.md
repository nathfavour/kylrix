# selfhost/

Self-hosting infrastructure for Kylrix.

## Files

| File | Purpose |
|------|---------|
| `setup.sh` | Interactive setup wizard — generates `.env` with secure defaults |
| `provision-schema.sh` | Creates Appwrite databases, tables, columns, indexes, and storage buckets |
| `Caddyfile` | Caddy reverse proxy config with automatic HTTPS |
| `healthcheck.sh` | Container health check (wget → curl → node fallback) |

## Quick Start

```bash
# 1. Run the setup wizard
make setup

# 2. Start everything
make up

# 3. Provision the Appwrite schema
make schema-push
```

## Two Deployment Modes

### Full Stack (recommended for fresh installs)
Runs Kylrix + Appwrite + MariaDB + Redis + Caddy. Everything self-contained.

```bash
make up
```

### App Only (bring your own Appwrite)
If you already have Appwrite running (cloud or self-hosted elsewhere), use:

```bash
make app-only
```

Set `APPWRITE_ENDPOINT` and `APPWRITE_PROJECT_ID` in `.env` first.

## Schema Provisioning

`provision-schema.sh` reads `appwrite.config.json` from the project root and creates all resources via the Appwrite REST API. It requires:

- `APPWRITE_ENDPOINT` — Your Appwrite API URL
- `APPWRITE_PROJECT_ID` — Your Appwrite project ID
- `APPWRITE_API_KEY` — A server-side API key with full access

The script is **idempotent**: re-running it safely skips existing resources.

## Useful Commands

```bash
make help           # Show all available commands
make status         # Check service health
make logs           # Follow all service logs
make logs-kylrix    # Follow Kylrix logs only
make logs-appwrite  # Follow Appwrite logs only
make backup         # Backup all persistent volumes
make update         # Pull latest images, rebuild, restart
make clean          # Nuclear option: remove everything
make shell          # Open a shell in the Kylrix container
```
