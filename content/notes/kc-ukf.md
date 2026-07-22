---
title: KC-UKF research report — multi-sensor fusion under adversarial degradation
repo: Darth-Hidious/kc-ukf
slug: kc-ukf
excerpt: Report and verification suite for Compatibility-Field UKF. Strong on acute spoofing; weaker where model mismatch or chronic noise dominate.
image: https://raw.githubusercontent.com/Darth-Hidious/kc-ukf-nav/main/figures/fig_kitti_scenarios.png
date: 2026-04-10
order: 3
language: Python
---

This repository is the research report, Monte Carlo harness, and evidence ledger behind KC-UKF. The navigation-focused JAX package and KITTI figures live in [kc-ukf-nav](/notes/kc-ukf-nav); this tree is where the paper claims, baselines, and verification audits sit.

![Five-condition stress view used across the KC-UKF line of work](https://raw.githubusercontent.com/Darth-Hidious/kc-ukf-nav/main/figures/fig_kitti_scenarios.png)

## TL;DR without the badges

CFE turns per-sensor health (NIS through Gaussian kernels) into a softmax trust distribution that modulates measurement noise inside the UKF update. On Scenario A — evasive UAV with acute adversarial attacks — KC-UKF lands around **7.54 m** position RMSE across 100 Monte Carlo trials, roughly a 20–37% improvement over seven baselines with Holm–Bonferroni corrected significance.

The report is also explicit about where it does *not* win:

- Ballistic re-entry: model mismatch dominates; KC-UKF ranks behind IMM-UKF.
- Urban low-slow-small tracking: chronic degradation favors Sage–Husa-style adaptation.
- Maritime cross-domain: the architecture generalizes once CFE widths and base weights are re-tuned (MCMC), not when UAV defaults are cargo-culted across domains.

Point of the package is a reproducible comparison, not one cherry-picked plot.

## What you get in the tree

- **Paper** — XeLaTeX report (PDF built in CI) plus CFE algorithm supplement.
- **Code** — KC-UKF core, AF/SH/Huber/WI/IMM baselines, scenario runners, maritime MCMC, figure generators.
- **Verification** — claim ledger (`T2_claims.csv`), SymPy equation audit, claim-to-code pairing, raw stdout of numerical reruns.

If you only want the spoof-resilient GNSS/INS story on real KITTI, start with the [kc-ukf-nav note](/notes/kc-ukf-nav). If you want the broader multi-scenario report and the audit trail, this is the source of record ([Zenodo](https://doi.org/10.5281/zenodo.19506045)).
