---
title: PRISM — materials discovery CLI
repo: Darth-Hidious/PRISM
slug: prism
excerpt: Rust CLI for materials discovery — knowledge graph, CALPHAD, compute backends, research mesh.
image: https://raw.githubusercontent.com/Darth-Hidious/PRISM/main/docs/assets/prism-banner.png
date: 2026-06-01
order: 1
language: Rust
---

CLI and agent shell for MARC27’s materials platform. One binary: query alloys, run compute, talk to a federated knowledge graph.

![PRISM banner](https://raw.githubusercontent.com/Darth-Hidious/PRISM/main/docs/assets/prism-banner.png)

## Role

Materials work usually means wiring OPTIMADE, CALPHAD, ML predictors, and cluster jobs by hand. PRISM puts an agent on that stack — query a platform, dig one step deeper, or launch a job on MARC27 / SSH / Kubernetes / SLURM.

## Install / use

```bash
curl -fsSL https://prism.marc27.com/install.sh | bash
prism                    # interactive agent
prism query --platform "nickel superalloys"
prism research "high-entropy alloys" --depth 1
prism doctor
```

Slash commands (`/model`, `/agent`, `/usage`, …), streaming answers, inline tool cards. `prism doctor` prints the boot report.

## Pieces

- **Knowledge graph** — lookup, semantic / platform queries, CSV ingest
- **Compute** — containers; BYOC via SSH, Kubernetes, or SLURM
- **Mesh** — local node, mDNS discovery, publish datasets
- **Binaries** — Linux, macOS, Windows (or build with Cargo)

Working on this now.
