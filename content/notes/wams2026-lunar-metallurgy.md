---
title: Terrane-aware lunar metallurgy — WAMS 2026
repo: Darth-Hidious/wams2026-lunar-metallurgy
slug: wams2026-lunar-metallurgy
excerpt: LP-GRS chemistry → terrane labels, resource indices, alloy/process maps. Analysis code for WAMS 2026 paper #68.
image: https://raw.githubusercontent.com/Darth-Hidious/wams2026-lunar-metallurgy/main/figures/fig_manufacturing_roadmap.png
date: 2026-03-01
order: 4
language: Python
---

Companion code for WAMS 2026 Paper #68: *Refractory High-Entropy Alloys and Hybrid Additive Routes for Metallurgy in Lunar Mare, Highlands and KREEP Terranes* (S. Y. Kovid and K. Gruning, Bimo Tech).

![Manufacturing roadmap](https://raw.githubusercontent.com/Darth-Hidious/wams2026-lunar-metallurgy/main/figures/fig_manufacturing_roadmap.png)

## Setup

Mare, highlands, and KREEP have different oxide / trace budgets, so alloy and process choices differ by terrane. This pipeline maps Lunar Prospector GRS chemistry into terrane labels, metallurgical indices, and manufacturing-relevant figures for the paper.

## Pipeline

Input: LP-GRS elemental abundances (~11k equal-area 2° pixels — FeO, TiO₂, Al₂O₃, CaO, MgO, SiO₂, K/Th/U).

1. **Preprocess** — CLR, imputation, terrane classification
2. **PCA / clustering** — loadings, silhouette / DBI
3. **Indices** — I_FeTi, I_AlCa, I_KREEP
4. **Compatibility** — terrane → alloy / process mapping
5. **Thermo** — binary and RHEA phase diagrams (pycalphad, COST 507 / published `.tdb`)

Example run counts: ~8.5k highlands, ~1.2k mare, ~1.6k KREEP; silhouette ≈ 0.37, DBI ≈ 1.14.

## Repo map

- `notebooks/wams2026_pipeline.ipynb` — data → PCA → indices → maps
- `scripts/` — Monte Carlo sensitivity, break-even panels, dilution / RHEA diagrams
- `phase_diagrams/` — Fe–Ti, Al–Fe, Al–Ti, Al–Ni; HfNbTaTiZr / MoNbTaTiV
- `figures/` — paper figures (roadmap PNG above; most others PDF)

LP-GRS provenance: `data/DATA_SOURCES.md` (NASA PDS; Prettyman et al. 2006).
