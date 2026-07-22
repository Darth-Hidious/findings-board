---
title: KC-UKF research report
repo: Darth-Hidious/kc-ukf
slug: kc-ukf
excerpt: Report and verification suite for Compatibility-Field UKF. Strong on acute spoofing; weaker on model mismatch and chronic noise.
image: https://raw.githubusercontent.com/Darth-Hidious/kc-ukf-nav/main/figures/fig_kitti_scenarios.png
date: 2026-04-10
order: 3
language: Python
---

Research report, Monte Carlo harness, and verification ledger for KC-UKF. The JAX / KITTI navigation package is in [kc-ukf-nav](/notes/kc-ukf-nav).

![Five-condition stress view](https://raw.githubusercontent.com/Darth-Hidious/kc-ukf-nav/main/figures/fig_kitti_scenarios.png)

## Results

CFE turns per-sensor NIS (through Gaussian kernels) into a softmax trust distribution that modulates measurement noise in the UKF update.

Scenario A — evasive UAV, acute adversarial attacks — about **7.54 m** position RMSE over 100 Monte Carlo trials, roughly 20–37% better than seven baselines (Holm–Bonferroni corrected).

Where it loses:

- Ballistic re-entry: model mismatch; behind IMM-UKF
- Urban low-slow-small: chronic degradation; Sage–Husa wins
- Maritime: only after MCMC retune of CFE widths / weights — UAV defaults do not transfer

## Repo contents

- **Paper** — XeLaTeX report (CI PDF) + CFE supplement
- **Code** — KC-UKF, baselines (AF/SH/Huber/WI/IMM), scenario runners, maritime MCMC, figures
- **Verification** — claim ledger, SymPy audit, claim-to-code pairing, rerun logs

KITTI GNSS/INS writeup: [kc-ukf-nav](/notes/kc-ukf-nav). Archival record: [Zenodo](https://doi.org/10.5281/zenodo.19506045).
