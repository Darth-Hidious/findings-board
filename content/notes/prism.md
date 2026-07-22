---
title: PRISM — an agent for materials discovery
repo: Darth-Hidious/PRISM
slug: prism
excerpt: Rust CLI for materials discovery — knowledge graph, CALPHAD, compute backends, research mesh.
image: https://raw.githubusercontent.com/Darth-Hidious/PRISM/main/docs/assets/prism-banner.png
date: 2026-06-01
order: 1
language: Rust
---

PRISM is the CLI and agent shell for MARC27’s materials platform. One binary: query alloys, run compute, talk to a federated knowledge graph.

![PRISM banner](https://raw.githubusercontent.com/Darth-Hidious/PRISM/main/docs/assets/prism-banner.png)

## What it is for

Materials discovery usually means gluing OPTIMADE feeds, CALPHAD runs, ML predictors, and cluster jobs by hand. PRISM puts an agent in front of that stack so you can query a platform, dig one research step deeper, or launch a job on MARC27 / SSH / Kubernetes / SLURM without rewriting the glue.

## How you meet it

```bash
curl -fsSL https://prism.marc27.com/install.sh | bash
prism                    # interactive agent
prism query --platform "nickel superalloys"
prism research "high-entropy alloys" --depth 1
prism doctor             # boot diagnostics
```

Interactive mode is slash-command driven (`/model`, `/agent`, `/usage`, …) with streaming answers and inline tool cards. `prism doctor` prints the full boot report (platform, auth, graph, models, compute, mesh, policy).

## Under the hood

- **Knowledge graph** — local lookup, semantic / platform queries, CSV ingest with optional schema-only and watch modes.
- **Compute** — containerized runs with BYOC via SSH, Kubernetes, or SLURM; deploy and job-status commands for longer-lived services.
- **Mesh** — local node with a bundled graph; LAN discovery over mDNS; publish datasets to peers.
- **Binaries** — Linux, macOS, Windows; or build from source with Cargo.

## Status

Public CLI and docs. I’m working on this now.
