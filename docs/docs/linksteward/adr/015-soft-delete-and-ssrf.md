# ADR – Soft Delete und SSRF-Schutz

## Status

Accepted

## Entscheidung

Soft Delete ist Standard; URL-Abrufe nutzen zentralen SSRF-Schutz mit Homelab-Allowlist.

## Konsequenzen

### Vorteile

- Datenverlust reduziert
- sichere Defaults

### Nachteile

- mehr Speicher
- Allowlist-Komplexität

## Änderbarkeit

Diese Entscheidung kann später ersetzt werden. Dann sollte dieser ADR als `superseded` markiert und auf den neuen ADR verwiesen werden.
