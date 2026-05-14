# ADR 016 - SQLite for v0.1-alpha

## Status

Accepted

## Kontext

LinkSteward ist ein Fork von KaraKeep und befindet sich in der v0.1-alpha / fruehen Implementierungsphase. Die finale technische Analyse und die Agent-Regeln legen fest, dass KaraKeep fuer die Alpha die technische Basis bleibt und dass der erste Alpha-Slice klein, reviewbar und kompatibilitaetsorientiert bleiben soll.

KaraKeep verwendet im aktuellen Ist-Zustand SQLite. Ein PostgreSQL-Umbau waere vor der Alpha ein grundlegender Infrastruktur- und Migrationswechsel mit hohem Risiko fuer Zeitplan, Tests, Migrationen und Upstream-Kompatibilitaet.

## Entscheidung

- SQLite bleibt fuer LinkSteward v0.1-alpha bestehen.
- Es gibt keinen PostgreSQL-Umbau vor der Alpha.
- Die Architektur-Dokumentation muss den tatsaechlichen Ist-Zustand korrekt widerspiegeln.
- PostgreSQL kann spaeter als separate Zielentscheidung neu geprueft werden.

## Konsequenzen

LinkSteward entwickelt den ersten Alpha-Slice auf der vorhandenen KaraKeep-Datenbankbasis. Datenmodell-Erweiterungen fuer Alpha muessen mit SQLite kompatibel bleiben und duerfen keine implizite PostgreSQL-Abhaengigkeit einfuehren.

Dokumentation, Issues und ADRs muessen vermeiden, PostgreSQL als bereits beschlossene oder vorhandene Architektur zu beschreiben. Falls PostgreSQL spaeter relevant wird, braucht es eine eigene ADR mit Migrationspfad, Betriebsmodell, Teststrategie und Rueckfalloption.

## Vorteile

- Der erste Alpha-Slice bleibt nah an der bestehenden KaraKeep-Basis.
- Keine zusaetzliche Datenbankmigration blockiert Linkwarden-Kompatibilitaet oder Floccus-Tests.
- Das Risiko fuer Upstream-Divergenz bleibt kleiner.
- Lokale Entwicklung und Tests bleiben fuer die Alpha einfacher.
- Die Architektur-Dokumentation bleibt ehrlich zum aktuellen technischen Stand.

## Nachteile / Risiken

- SQLite kann spaeter Grenzen bei Parallelitaet, Mehrbenutzerbetrieb oder Deployment-Szenarien erreichen.
- Spaetere PostgreSQL-Unterstuetzung kann eigene Migrationsarbeit erfordern.
- Entscheidungen im Alpha-Datenmodell muessen so getroffen werden, dass ein spaeterer Datenbankwechsel nicht unnoetig erschwert wird.

## Review-Gate / spaetere Neubewertung

PostgreSQL wird erst nach der v0.1-alpha neu bewertet. Ein Review sollte erfolgen, wenn der erste echte Browser-Bookmark-Sync funktioniert und klarer ist, welche Last-, Deployment- und Mehrbenutzeranforderungen LinkSteward tatsaechlich hat.

Eine spaetere PostgreSQL-ADR muss mindestens Klaerungen zu Migrationen, Datenkonsistenz, CI-Testmatrix, Docker-Setup und Upstream-Kompatibilitaet enthalten.

## Bezug zur finalen Analyse

Diese ADR basiert auf `docs/docs/linksteward/analysis/karakeep-analysis-v0.1.md` und spiegelt die dort festgehaltene Alpha-Entscheidung wider: SQLite bleibt fuer v0.1-alpha bestehen, PostgreSQL ist keine Voraussetzung fuer den ersten Alpha-Slice. Sie uebernimmt ausserdem die Agent-Regel aus `AGENTS.md`, dass vor der Alpha kein PostgreSQL-Umbau erfolgen soll.
