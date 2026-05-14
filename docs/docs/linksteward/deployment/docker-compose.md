# Docker Compose Deployment v0.1

## Ziel

Docker Compose ist der primäre Installationsweg für LinkSteward.

## Services

```text
linksteward-web
linksteward-worker
linksteward-browser
postgres
meilisearch
ollama, optional
reverse-proxy, optional extern
```

## Beispiel .env

```env
LINKSTEWARD_BASE_URL=https://linksteward.example.com
LINKSTEWARD_SECRET=change-me
DATABASE_URL=postgresql://linksteward:password@postgres:5432/linksteward

MEILI_ADDR=http://meilisearch:7700
MEILI_MASTER_KEY=change-me

STORAGE_BACKEND=local
STORAGE_PATH=/data/assets

BROWSER_SERVICE_URL=http://linksteward-browser:9222

ARCHIVE_READER_TEXT=true
ARCHIVE_SCREENSHOT=true
ARCHIVE_PDF=false
ARCHIVE_SINGLE_HTML=false
ARCHIVE_OCR=false
ARCHIVE_VIDEO=false

AI_ENABLED=true
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.1

LINKWARDEN_COMPAT_ENABLED=true
KARAKEEP_COMPAT_ENABLED=true

URL_FETCH_ALLOW_PRIVATE_NETWORKS=false
URL_FETCH_ALLOWLIST=
```

## Volumes

```text
postgres_data
meili_data
linksteward_assets
linksteward_imports
linksteward_exports
```

## Offene Aufgaben

```text
├─ final docker-compose.yml erstellen
├─ Healthchecks
├─ Reverse Proxy Beispiele
├─ Backup/Restore testen
└─ Ressourcenlimits dokumentieren
```
