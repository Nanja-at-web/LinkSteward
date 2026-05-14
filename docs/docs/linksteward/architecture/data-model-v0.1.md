# LinkSteward – Datenmodell / Datenbankschema v0.1

## Designziele

```text
Ziele
├─ KaraKeep als technische Basis erweiterbar halten
├─ Linkwarden-artige Archivierung abbilden
├─ Linkwarden-kompatible API unterstützen
├─ KaraKeep-kompatible API unterstützen
├─ Floccus-Sync stabil ermöglichen
├─ Browser-Bookmark-Import/Export unterstützen
├─ Themenbaum und Domain-Kategorisierung abbilden
├─ Regeln und KI-Vorschläge speichern
├─ Duplikate gruppieren und sicher zusammenführen
├─ Broken-Link-Status und Prüfhistorie speichern
├─ Soft Delete / Papierkorb ermöglichen
├─ spätere Team-/Workspace-Fähigkeit vorbereiten
└─ spätere Sync-Ziele vorbereiten
```

## Zentrales Objekt: Item

```text
Item-Typen
├─ link
├─ note
├─ image
├─ pdf
├─ file
├─ video
└─ rss_entry, später optional
```

## Entity-Übersicht

```text
Kern
├─ users
├─ workspaces, später
├─ memberships, später
├─ items
├─ item_assets
├─ collections
├─ collection_items
├─ tags
├─ item_tags
├─ api_keys
├─ settings
└─ trash_entries

Archivierung
├─ archive_jobs
├─ item_assets
└─ archive_events

Ordnungssystem
├─ rules
├─ rule_runs
├─ domains
├─ ai_suggestions
└─ smart_collection_queries

Duplikate
├─ duplicate_groups
├─ duplicate_candidates
└─ merge_events

Broken Links
├─ link_health_checks
├─ link_repair_suggestions
└─ url_history

Import/Export/Sync
├─ import_jobs
├─ import_job_items
├─ export_jobs
├─ sync_clients
├─ sync_events
└─ external_mappings
```

## Wichtige Item-Felder

```text
items
├─ id
├─ user_id
├─ workspace_id nullable
├─ type
├─ title
├─ url
├─ normalized_url
├─ canonical_url
├─ final_url
├─ domain
├─ subdomain
├─ root_domain
├─ url_hash
├─ content_hash
├─ source
├─ source_id
├─ primary_collection_id
├─ archive_status
├─ link_health_status
├─ duplicate_status
├─ revision
├─ metadata_json
├─ created_at
├─ updated_at
└─ deleted_at
```

## Statuswerte

```text
archive_status:
├─ disabled
├─ pending
├─ processing
├─ completed
├─ partial
└─ failed

link_health_status:
├─ unknown
├─ healthy
├─ redirected
├─ temporarily_unavailable
├─ requires_auth
├─ rate_limited
├─ broken
├─ dns_error
├─ tls_error
├─ archived_only
└─ needs_review

duplicate_status:
├─ unknown
├─ unique
├─ possible_duplicate
├─ duplicate
├─ merged
└─ ignored
```

## Erweiterungsstrategie

Da KaraKeep technische Basis ist, sollte LinkSteward möglichst additiv erweitern:

```text
linksteward_item_extensions
linksteward_archive_jobs
linksteward_duplicate_groups
linksteward_link_health_checks
linksteward_rules
linksteward_ai_suggestions
linksteward_external_mappings
```

## Priorisierte Umsetzung

```text
Phase 1: users, api_keys, items, collections, tags, external_mappings
Phase 2: item_assets, archive_jobs, archive_events
Phase 3: domains, rules, ai_suggestions, settings
Phase 4: duplicate_groups, merge_events, trash_entries, link_health_checks
Phase 5: import_jobs, export_jobs, sync_events
```
