# LinkSteward – API-Spezifikation v0.1

## API-Schichten

```text
LinkSteward API-Schichten
├─ Native LinkSteward API
│  └─ /api/linksteward/v1/*
├─ Linkwarden Compatibility API
│  └─ /api/v1/*
├─ KaraKeep Compatibility API
│  └─ KaraKeep-kompatible Routen
└─ spätere Compatibility APIs
   ├─ Nextcloud Bookmarks API
   ├─ WebDAV/XBEL
   └─ Git/Cloud-Sync Adapter
```

## Auth

```text
Authorization: Bearer <API_TOKEN>
```

Scopes:

```text
read
write
sync
archive
ai
import_export
admin
```

## Native LinkSteward API

```text
GET    /api/linksteward/v1/me

GET    /api/linksteward/v1/api-keys
POST   /api/linksteward/v1/api-keys
DELETE /api/linksteward/v1/api-keys/:id
POST   /api/linksteward/v1/api-keys/:id/revoke

GET    /api/linksteward/v1/items
POST   /api/linksteward/v1/items
GET    /api/linksteward/v1/items/:id
PATCH  /api/linksteward/v1/items/:id
DELETE /api/linksteward/v1/items/:id
POST   /api/linksteward/v1/items/:id/restore
POST   /api/linksteward/v1/items/:id/archive
POST   /api/linksteward/v1/items/:id/check-link

GET    /api/linksteward/v1/collections
POST   /api/linksteward/v1/collections
GET    /api/linksteward/v1/collections/tree
GET    /api/linksteward/v1/collections/:id
PATCH  /api/linksteward/v1/collections/:id
DELETE /api/linksteward/v1/collections/:id

GET    /api/linksteward/v1/tags
POST   /api/linksteward/v1/tags
PATCH  /api/linksteward/v1/tags/:id
DELETE /api/linksteward/v1/tags/:id
```

## Linkwarden-kompatible API

Ziel: Floccus im Linkwarden-Modus.

```text
GET    /api/v1/collections
POST   /api/v1/collections
GET    /api/v1/collections/:id
PATCH  /api/v1/collections/:id
DELETE /api/v1/collections/:id

GET    /api/v1/links
POST   /api/v1/links
GET    /api/v1/links/:id
PATCH  /api/v1/links/:id
DELETE /api/v1/links/:id

GET    /api/v1/tags
POST   /api/v1/tags
```

## KaraKeep-kompatible API

Ziel: Floccus im KaraKeep-Modus.

```text
GET    /bookmarks
POST   /bookmarks
GET    /bookmarks/:bookmarkId
PATCH  /bookmarks/:bookmarkId
DELETE /bookmarks/:bookmarkId

GET    /lists
POST   /lists
GET    /lists/:listId
PATCH  /lists/:listId
DELETE /lists/:listId
GET    /lists/:listId/bookmarks
POST   /lists/:listId/bookmarks
DELETE /lists/:listId/bookmarks/:bookmarkId

GET    /tags
POST   /tags
```

## Import/Export API

```text
POST /api/linksteward/v1/import/preview
POST /api/linksteward/v1/import/jobs
GET  /api/linksteward/v1/import/jobs/:id

POST /api/linksteward/v1/export/preview
POST /api/linksteward/v1/export/jobs
GET  /api/linksteward/v1/export/jobs/:id/download
```

## Duplikat API

```text
GET  /api/linksteward/v1/duplicates/groups
POST /api/linksteward/v1/duplicates/scan
GET  /api/linksteward/v1/duplicates/groups/:id
POST /api/linksteward/v1/duplicates/groups/:id/ignore
POST /api/linksteward/v1/duplicates/groups/:id/false-positive
POST /api/linksteward/v1/duplicates/groups/:id/merge-preview
POST /api/linksteward/v1/duplicates/groups/:id/merge
```

## Broken-Link API

```text
POST /api/linksteward/v1/items/:id/check-link
POST /api/linksteward/v1/collections/:id/check-links
POST /api/linksteward/v1/domains/:domain/check-links
GET  /api/linksteward/v1/link-health/broken
GET  /api/linksteward/v1/link-health/repair-suggestions
POST /api/linksteward/v1/link-health/repair-suggestions/:id/apply
POST /api/linksteward/v1/link-health/repair-suggestions/:id/reject
```

## Floccus-Einschränkung

In Kompatibilitäts-APIs nur ausgeben:

```text
http(s)
ftp
javascript
```

Nicht ausgeben:

```text
data:
chrome:
file:
about:
edge:
moz-extension:
chrome-extension:
Notizen ohne URL
Dateien ohne URL
```
