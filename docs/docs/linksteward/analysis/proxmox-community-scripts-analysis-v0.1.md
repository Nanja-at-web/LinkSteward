# Proxmox Community Scripts Analyse v0.1

## Ziel

LinkSteward soll Proxmox-kompatibel werden und später ein LXC-Script erhalten.

## Aktuelle Empfehlung

```text
Hauptweg:
Docker Compose

Zusatzweg:
Proxmox LXC Script
```

## Zielarchitektur LXC

```text
/opt/linksteward
├─ App-Code
├─ Web Build
└─ Worker Code

/opt/linksteward_data
├─ assets
├─ screenshots
├─ exports
├─ imports
├─ logs
└─ backups

/etc/linksteward
└─ linksteward.env
```

## Services

```text
linksteward-web.service
linksteward-worker.service
linksteward-browser.service
meilisearch.service
postgresql.service
ollama.service, optional
```

## Ressourcen

```text
Minimum
├─ 2 vCPU
├─ 4 GB RAM
└─ 20 GB Disk

Empfohlen
├─ 4 vCPU
├─ 8 GB RAM
└─ 50+ GB Disk
```

## Zu prüfen

```text
├─ Debian oder Ubuntu als Basis
├─ unprivileged LXC möglich?
├─ Chromium/Playwright im LXC stabil?
├─ Meilisearch systemd Service
├─ PostgreSQL Setup
├─ Update-Script
├─ Backup/Restore
└─ Community-Scripts CONTRIBUTING-Anforderungen
```
