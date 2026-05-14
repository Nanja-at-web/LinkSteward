# ADR 017 - Soft Delete via Extension Table for v0.1-alpha

## Status

Accepted

## Kontext

LinkSteward soll im ersten Alpha-Slice echten Browser-Bookmark-Sync ermoeglichen. Dabei sind Loeschungen besonders kritisch: Ein fehlerhafter Sync darf keine irreversiblen Datenverluste verursachen.

Die finale Analyse empfiehlt fuer v0.1-alpha einen additiven Ansatz ueber Extension Tables. Das KaraKeep-Kernschema soll in der Alpha moeglichst unveraendert bleiben, damit der Fork reviewbar bleibt und die Divergenz zur technischen Basis nicht unnoetig waechst.

## Entscheidung

- Soft Delete fuer Alpha wird additiv ueber `linksteward_item_extensions.deletedAt` modelliert.
- Es wird keine direkte `bookmarks.deletedAt`-Spalte im ersten Alpha-Slice eingefuehrt.
- Das KaraKeep-Kernschema bleibt fuer Alpha moeglichst unveraendert.
- Es gibt ein Review-Gate nach dem ersten erfolgreichen Floccus-Sync.
- Restore, Hard Delete und Papierkorb bleiben offene Folgefragen.

## Konsequenzen

Kompatibilitaets-APIs und Sync-Logik muessen geloeschte LinkSteward-Items ueber `linksteward_item_extensions.deletedAt` erkennen und entsprechend behandeln. Die KaraKeep-Basistabellen bleiben fuer den ersten Alpha-Slice unberuehrt, soweit keine ausdruecklich beschlossene Ausnahme noetig wird.

Restore-, Hard-Delete- und Papierkorb-Verhalten werden nicht implizit mitentschieden. Sie muessen nach dem ersten Sync-Erfolg separat spezifiziert werden.

## Vorteile

- Das Loeschmodell reduziert das Risiko irreversibler Datenverluste im Alpha-Sync.
- Das KaraKeep-Kernschema bleibt nah am Upstream.
- Die Aenderung ist additiv und dadurch besser reviewbar.
- Spaetere Anpassungen bleiben moeglich, wenn reale Floccus-Sync-Ergebnisse vorliegen.
- Die Entscheidung passt zum Extension-Table-Ansatz der finalen Analyse.

## Nachteile / Risiken

- APIs und Queries muessen die Extension Table konsequent beruecksichtigen.
- Inkonsistenzen sind moeglich, wenn einzelne Pfade `deletedAt` nicht filtern oder nicht setzen.
- Ein indirektes Soft-Delete-Modell kann komplexer sein als eine direkte Spalte auf `bookmarks`.
- Restore, Hard Delete und Papierkorb sind noch nicht fachlich entschieden.

## Review-Gate / spaetere Neubewertung

Nach dem ersten erfolgreichen Floccus-Sync wird geprueft, ob `linksteward_item_extensions.deletedAt` fuer die realen Sync-Faelle ausreicht. Das Review muss insbesondere Loeschungen, Wiederanlage, Konflikte und wiederholte bidirektionale Sync-Laeufe betrachten.

Erst danach wird entschieden, ob das Extension-Table-Modell beibehalten, erweitert oder durch eine direkte Schema-Erweiterung ersetzt werden soll.

## Bezug zur finalen Analyse

Diese ADR basiert auf `docs/docs/linksteward/analysis/karakeep-analysis-v0.1.md`. Die finale Analyse empfiehlt fuer v0.1-alpha Extension Tables zuerst, keine direkte `bookmarks.deletedAt`-Spalte im ersten Alpha-Slice und Soft Delete ueber `linksteward_item_extensions.deletedAt`. `AGENTS.md` bestaetigt diese Punkte als verbindliche Alpha-Regeln.
