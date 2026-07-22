---
title: Terrane-aware lunar metallurgy — WAMS 2026 pipeline
repo: Darth-Hidious/wams2026-lunar-metallurgy
slug: wams2026-lunar-metallurgy
excerpt: From Lunar Prospector GRS chemistry to terrane labels, resource indices, and alloy/process maps — the analysis stack behind the WAMS 2026 paper on metallurgy in mare, highlands, and KREEP.
image: https://raw.githubusercontent.com/Darth-Hidious/wams2026-lunar-metallurgy/main/figures/fig_manufacturing_roadmap.png
date: 2026-03-01
order: 4
language: Python
---

Companion code for WAMS 2026 Paper #68: *Refractory High-Entropy Alloys and Hybrid Additive Routes for Metallurgy in Lunar Mare, Highlands and KREEP Terranes* (S. Y. Kovid and K. Gruning, Bimo Tech).

![Manufacturing roadmap from the WAMS 2026 analysis](https://raw.githubusercontent.com/Darth-Hidious/wams2026-lunar-metallurgy/main/figures/fig_manufacturing_roadmap.png)

## The question

Lunar ISRU is not one chemistry problem. Mare, highlands, and KREEP terranes bring different oxide and trace-element budgets, which means different alloy families and process routes make sense in different places. This pipeline turns orbital geochemistry into terrane labels, metallurgical potential indices, and maps that feed the paper’s alloy and manufacturing arguments.

## What the pipeline does

Starting from Lunar Prospector Gamma Ray Spectrometer (LP-GRS) elemental abundances (~11k equal-area 2° pixels: FeO, TiO₂, Al₂O₃, CaO, MgO, SiO₂, plus K/Th/U):

1. **Preprocess** — CLR transform, imputation, terrane classification.
2. **PCA / clustering** — loadings, silhouette / DBI checks on the terrane structure.
3. **Indices** — I_FeTi, I_AlCa, I_KREEP as compact resource scores.
4. **Compatibility** — terrane → candidate alloy / process mapping.
5. **Thermo** — binary and RHEA phase-stability diagrams via pycalphad and COST 507 / published `.tdb` assessments.

Typical classification counts from the notebook run: on the order of ~8.5k highlands, ~1.2k mare, ~1.6k KREEP pixels, with cluster metrics reported alongside the maps (silhouette ≈ 0.37, DBI ≈ 1.14 in the paper run).

## How to read the repo

You do not need to parse every CSV to get the story:

- `notebooks/wams2026_pipeline.ipynb` — data → PCA → indices → maps.
- `scripts/` — Monte Carlo sensitivity, dual-purpose mass break-even panels, dilution / RHEA diagram generators.
- `phase_diagrams/` — Fe–Ti, Al–Fe, Al–Ti, Al–Ni binaries and HfNbTaTiZr / MoNbTaTiV stability.
- `figures/` — publication figures (roadmap above is the PNG overview; most others ship as PDF).

Data provenance for LP-GRS is documented under `data/DATA_SOURCES.md` (NASA PDS Geosciences; Prettyman et al. 2006).

## Why it matters here

This is the public analysis spine for the WAMS 26 / ESA ESTEC talk: not a pitch deck, but the reproducible path from orbital chemistry to terrane-aware metallurgy choices.
