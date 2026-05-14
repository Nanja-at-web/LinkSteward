# LinkSteward Documentation Package v0.1

---
title: LinkSteward
sidebar_position: 1
---

> **Hinweis:** `LinkSteward` ist aktuell nur ein interner Arbeitstitel / Codename.  
> Der finale Produktname muss vor öffentlichem Release neu entschieden werden.

Dieses ZIP enthält die bisher erarbeiteten Ergebnisse als Markdown-Dateien für einen Repo/Fork-Start.

Erstellt am: 2026-05-13

## Struktur

```text
docs/
├─ product/
│  ├─ vision.md
│  ├─ requirements-v0.1.md
│  ├─ mvp-scope-v0.1.md
│  └─ naming.md
├─ architecture/
│  ├─ architecture-v0.1.md
│  ├─ module-structure-v0.1.md
│  ├─ data-model-v0.1.md
│  ├─ api-spec-v0.1.md
│  └─ security-v0.1.md
├─ adr/
│  ├─ README.md
│  ├─ 001-karakeep-as-base.md
│  ├─ 002-extension-layer.md
│  ├─ 003-agpl-license.md
│  ├─ 004-api-first-floccus.md
│  ├─ 005-linkwarden-compatible-api.md
│  ├─ 006-karakeep-compatible-api.md
│  ├─ 007-docker-compose-primary.md
│  ├─ 008-proxmox-lxc-secondary.md
│  ├─ 009-ollama-default-ai.md
│  ├─ 010-ai-optional-disableable.md
│  ├─ 011-archiving-defaults.md
│  ├─ 012-duplicates-no-auto-delete.md
│  ├─ 013-broken-links-no-auto-repair.md
│  ├─ 014-ordering-rules-before-ai.md
│  └─ 015-soft-delete-and-ssrf.md
├─ roadmap/
│  ├─ roadmap-v0.1.md
│  ├─ github-issues-v0.1.md
│  └─ mvp-implementation-plan-v0.1.md
├─ analysis/
│  ├─ karakeep-analysis-v0.1.md
│  ├─ linkwarden-analysis-v0.1.md
│  ├─ floccus-compatibility-analysis-v0.1.md
│  ├─ proxmox-community-scripts-analysis-v0.1.md
│  └─ name-check-v0.1.md
├─ deployment/
│  ├─ docker-compose.md
│  ├─ proxmox-lxc.md
│  ├─ backup-restore.md
│  └─ update-guide.md
└─ testing/
   ├─ floccus-test-matrix.md
   ├─ import-export-test-cases.md
   ├─ duplicate-test-cases.md
   └─ broken-link-test-cases.md
```

## Aktuelle Startlinie

```text
LinkSteward MVP
├─ KaraKeep als Basis
├─ AGPL-3.0 Open Source
├─ Docker Compose
├─ Proxmox LXC Support
├─ Linkwarden-kompatible API
├─ KaraKeep-kompatible API
├─ Floccus-Support
├─ Bookmark HTML Import/Export
├─ Domain-/Themenbaum-Kategorisierung
├─ Ollama Auto-Tagging
├─ Duplikat-Erkennung
└─ Broken-Link-Monitor
```
