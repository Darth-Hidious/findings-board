---
title: PRISM — an agent for materials discovery
repo: Darth-Hidious/PRISM
slug: prism
excerpt: A single Rust binary that talks to knowledge graphs, CALPHAD, compute backends, and a research mesh — built so materials work feels like a conversation, not a pile of scripts.
image: https://raw.githubusercontent.com/Darth-Hidious/PRISM/main/docs/assets/prism-banner.png
date: 2026-06-01
order: 1
language: Rust
---

PRISM is the CLI and agent shell for MARC27’s materials platform. You install one binary, run `prism`, and get an interactive agent that can query alloys, kick off compute, and talk to a federated knowledge graph — without bouncing between notebooks, portals, and SSH sessions.

![PRISM banner](https://raw.githubusercontent.com/Darth-Hidious/PRISM/main/docs/assets/prism-banner.png)

## What it is for

The boring version: materials discovery still means stitching together OPTIMADE feeds, CALPHAD runs, ML predictors, and cluster jobs by hand. PRISM’s job is to put an agent in front of that stack so a researcher can ask for a platform (say nickel superalloys), dig one research depth deeper, or launch a job on MARC27 / SSH / Kubernetes / SLURM without rewriting glue each time.

## How you meet it

```bash
curl -fsSL https://prism.marc27.com/install.sh | bash
prism                    # interactive agent
prism query --platform "nickel superalloys"
prism research "high-entropy alloys" --depth 1
prism doctor             # boot diagnostics
```

The interactive mode is slash-command driven (`/model`, `/agent`, `/usage`, …) with streaming answers and inline tool cards when materials tools actually fire. Boot diagnostics report Platform, Auth, Knowledge Graph, LLM Models, Compute, Marketplace, Local Node, and Policy Engine on every launch.

## Under the hood

- **Knowledge graph** — local lookup, semantic / platform queries, CSV ingest with optional schema-only and watch modes.
- **Compute** — containerized runs with BYOC via SSH, Kubernetes, or SLURM; deploy and job-status commands for longer-lived services.
- **Mesh** — local node with a bundled graph; LAN discovery over mDNS; publish datasets to peers.
- **Shipping shape** — Rust release binaries for Linux, macOS, and Windows; also buildable from source with Cargo.

## Why it sits on this site

This is the public, installable artifact — CLI, agent shell, and docs. Partner / national program context stays off the site; if you want the tool, use the repo above. I’m actively working on it now.
