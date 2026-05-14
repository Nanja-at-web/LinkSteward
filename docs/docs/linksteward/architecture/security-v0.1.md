# LinkSteward – Security v0.1

## Hauptanforderungen

```text
Security
├─ Authentifizierung
├─ API Keys mit Scopes
├─ sichere Sessions
├─ Rate Limiting
├─ CORS-Konfiguration
├─ SSRF-Schutz
├─ Upload-Validierung
├─ Rechteprüfung
├─ Soft Delete
├─ Papierkorb
├─ sichere Defaults
└─ Audit Events später
```

## SSRF-Schutz

LinkSteward ruft URLs serverseitig ab. Das betrifft Archivierung, Metadatenabruf, Screenshots und Broken-Link-Checks.

Standardmäßig blockieren:

```text
localhost
127.0.0.0/8
10.0.0.0/8
172.16.0.0/12
192.168.0.0/16
169.254.0.0/16
::1
fc00::/7
fe80::/10
Cloud Metadata IPs
Redirects in private Netze
```

## Homelab-Allowlist

Da Homelab-Nutzer interne Links speichern möchten:

```text
Private Network Policy
├─ default: block
├─ allowlist: admin-configured
├─ warning in UI
└─ per-domain/per-subnet später möglich
```

## API Keys

```text
API Key Regeln
├─ Tokens nur gehasht speichern
├─ Token nur einmal im Klartext anzeigen
├─ dedizierte Floccus Sync Tokens verwenden
├─ Scopes prüfen
├─ Widerruf ermöglichen
└─ optional Ablaufdatum
```

## Kritische Sicherheitsentscheidungen

```text
├─ keine automatische Duplikat-Löschung
├─ keine automatische Broken-Link-Reparatur
├─ Soft Delete statt Hard Delete
├─ Merge nur mit Vorschau
├─ Reparaturen nur nach Bestätigung
└─ SSRF-Prüfung zentral für alle URL-Abrufe
```
