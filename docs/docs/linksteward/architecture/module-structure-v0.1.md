# LinkSteward – Modulstruktur v0.1

## Module

```text
LinkSteward Module
├─ Core Module
├─ Auth/API Key Module
├─ Item Module
├─ Collection/Topic Tree Module
├─ Tag Module
├─ Compatibility Layer
│  ├─ Linkwarden Compat
│  └─ KaraKeep Compat
├─ Archive Module
├─ Duplicate Module
├─ Link Health Module
├─ Ordering/Rules Module
├─ AI/Ollama Module
├─ Import/Export Module
├─ Search Module
├─ Job Module
├─ Storage Module
├─ Settings Module
├─ Security Module
└─ Deployment Module
```

## Compatibility Layer

```text
Compatibility Layer
├─ Request Mapping
├─ Response Mapping
├─ Auth Mapping
├─ Error Mapping
├─ ID Mapping
├─ Unsupported Item Filtering
└─ Sync Event Logging
```

## Service-Struktur

```text
Services
├─ ItemService
├─ CollectionService
├─ TagService
├─ DomainService
├─ ArchiveService
├─ DuplicateService
├─ LinkHealthService
├─ RepairSuggestionService
├─ RuleService
├─ AIService
├─ ImportService
├─ ExportService
├─ SearchService
├─ StorageService
├─ SecurityUrlFetchService
├─ ApiKeyService
├─ JobService
└─ SettingsService
```

## Worker-Struktur

```text
Worker Jobs
├─ ArchiveJobProcessor
├─ MetadataExtractionJobProcessor
├─ ScreenshotJobProcessor
├─ ReaderTextJobProcessor
├─ DuplicateScanJobProcessor
├─ LinkHealthCheckJobProcessor
├─ RepairSuggestionJobProcessor
├─ RuleRunJobProcessor
├─ AIClassificationJobProcessor
├─ ImportJobProcessor
├─ ExportJobProcessor
├─ SearchIndexJobProcessor
└─ CleanupJobProcessor
```

## Empfohlene Ordnerstruktur

```text
apps/
├─ web/
├─ worker/
└─ browser-service/

packages/
├─ core/
├─ db/
├─ compat/
│  ├─ linkwarden/
│  └─ karakeep/
├─ archive/
├─ duplicates/
├─ link-health/
├─ ordering/
├─ ai/
├─ import-export/
├─ search/
├─ storage/
└─ security/

openapi/
docker/
proxmox/
docs/
tests/
```
