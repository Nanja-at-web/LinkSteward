# Broken Link Test Cases v0.1

## Statusfälle

```text
200 → healthy
301/302 → redirected
401/403 → requires_auth/forbidden, nicht automatisch broken
404/410 → broken wahrscheinlich
429 → rate_limited
500-599 → temporarily_unavailable
DNS Fehler → dns_error
TLS Fehler → tls_error
Timeout → temporarily_unavailable
```

## Reparaturvorschläge

```text
├─ http_to_https
├─ redirect_target
├─ canonical_url
├─ www_variant
├─ wayback_url später
├─ manual_replacement
└─ archive_only
```

## Tests

```text
├─ einzelnes Item prüfen
├─ Collection prüfen
├─ Domain prüfen
├─ Redirect-Kette speichern
├─ HTTPS-Vorschlag anzeigen
├─ Reparatur bestätigen
├─ Original-URL in Historie
├─ Reparatur ablehnen
└─ erneute Prüfung nach Reparatur
```

## Sicherheitsregeln

```text
├─ keine Reparatur ohne Bestätigung
├─ SSRF-Schutz bei jedem Abruf
├─ private IPs blockieren
├─ Allowlist nur Admin
└─ Redirects in private Netze blockieren
```
