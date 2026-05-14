# Proxmox LXC Deployment v0.1

## Ziel

LinkSteward soll Proxmox-freundlich installierbar sein.

## Varianten

```text
Variante A: Docker Compose in LXC
├─ nahe am Hauptdeployment
└─ geringerer Wartungsaufwand

Variante B: native LXC Installation mit systemd
├─ passt besser zu Community-Scripts
└─ höherer Wartungsaufwand
```

## Empfehlung

```text
MVP:
Docker Compose dokumentieren

Später:
Proxmox LXC Script als offizieller Zweitweg
```

## Systemd Services

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
Minimum:
2 vCPU, 4 GB RAM, 20 GB Disk

Empfohlen:
4 vCPU, 8 GB RAM, 50+ GB Disk
```
