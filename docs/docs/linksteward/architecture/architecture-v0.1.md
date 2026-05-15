# LinkSteward – Architektur v0.1

## Architekturziele

```text
Architekturziele
├─ KaraKeep als technische Basis nutzen
├─ LinkSteward-spezifische Erweiterungen additiv einbauen
├─ Linkwarden-artige Archivierung ergänzen
├─ Linkwarden- und KaraKeep-kompatible APIs bereitstellen
├─ Floccus-Support ohne eigene Browser Extension ermöglichen
├─ Worker-basierte Hintergrundverarbeitung nutzen
├─ Docker Compose als Hauptdeployment bereitstellen
├─ Proxmox LXC als offiziellen Zweitweg vorbereiten
├─ KI/Ollama modular integrieren
├─ Duplikate und Broken Links als eigene Module implementieren
├─ Datenmodell erweiterbar halten
└─ spätere Erweiterungen ermöglichen
```

## Systemübersicht

```text
LinkSteward
├─ Web App
├─ API Server
│  ├─ Native LinkSteward API
│  ├─ Linkwarden Compatibility API
│  └─ KaraKeep Compatibility API
├─ Worker
│  ├─ Archive Worker
│  ├─ Link Health Worker
│  ├─ Duplicate Worker
│  ├─ AI Worker
│  ├─ Import Worker
│  ├─ Export Worker
│  └─ Rule Worker
├─ Browser Service
│  ├─ Headless Chromium/Playwright
│  ├─ Screenshot
│  ├─ Reader Extraction
│  ├─ PDF optional
│  └─ Single HTML optional
├─ SQLite
├─ Meilisearch
├─ Storage
├─ Ollama optional
└─ Deployment
   ├─ Docker Compose
   └─ Proxmox LXC
```

> **Datenbank:** SQLite (better-sqlite3, WAL-Modus). Kein PostgreSQL in v0.1-alpha. Siehe ADR-016.

## Implementierungsstand v0.1-alpha

Linkwarden Compatibility API (implementiert):

- `GET /api/v1/collections` – read-only, manuelle Listen, E2E-getestet

Linkwarden Compatibility API (ausstehend):

- `GET /api/v1/links` – read-only, Link-Bookmarks (links.ts noch nicht erstellt)
- `POST/PATCH/DELETE /api/v1/collections`
- `POST/PATCH/DELETE /api/v1/links`
- Linkwarden-Floccus-Modus-Test

Vollständiger Endpunkte-Katalog: `docs/docs/linksteward/architecture/api-spec-v0.1.md`

## Docker Services

```text
Docker Services
├─ linksteward-web
├─ linksteward-worker
├─ linksteward-browser
├─ meilisearch
├─ ollama, optional
└─ reverse-proxy, optional extern
```

## Architekturprinzipien

```text
Prinzipien
├─ Karakeep-Basis nutzen
├─ LinkSteward-Erweiterungen additiv halten
├─ API-first entwickeln
├─ Floccus-Kompatibilität früh testen
├─ Worker für schwere Aufgaben nutzen
├─ Archivierung modular halten
├─ KI optional und lokal bevorzugt
├─ Duplikate niemals automatisch löschen
├─ Broken Links niemals automatisch reparieren
├─ SSRF-Schutz zentral erzwingen
├─ Docker Compose als Hauptweg
└─ Proxmox LXC als Homelab-freundlicher Zweitweg
```
