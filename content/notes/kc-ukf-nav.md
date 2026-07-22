---
title: KC-UKF on real KITTI — spoof-resilient GNSS/INS
repo: Darth-Hidious/kc-ukf-nav
slug: kc-ukf-nav
excerpt: Cross-sensor trust inside a classical UKF. KITTI drive 0001, ~47 m GPS spoof — conventional UKF ~61 m error, KC-UKF ~1.9 m.
image: https://raw.githubusercontent.com/Darth-Hidious/kc-ukf-nav/main/figures/fig_real_kitti.png
date: 2026-05-20
order: 2
language: Python
---

**KC-UKF** is an error-state unscented Kalman filter. The measurement update scales each sensor’s noise covariance by a cross-sensor compatibility score (CFE — Compatibility-Field Estimation): per-sensor NIS against the baseline noise model → Gaussian compatibility → softmax across sensors → R-inflation, inside one classical UKF update. No discrete fault switch. No learning at runtime.

![KC-UKF rejecting a GPS spoof on real KITTI data](https://raw.githubusercontent.com/Darth-Hidious/kc-ukf-nav/main/figures/fig_real_kitti.png)

## Mechanism

Per-sensor NIS is scored against the *baseline* noise model, mapped to compatibility, then used to inflate R inside a normal UKF update. Constants are named and bounded. A small supervised network can set them so you are not hand-tuning every scenario.

## KITTI results

Drive 0001, injected ~47 m GPS spoof on the recorded signals:

- Conventional UKF ≈ **61 m** error
- KC-UKF ≈ **1.9 m**

Slow drift below the GNSS noise floor is the harder case. Adaptive filters (including Sage–Husa) follow it to roughly 12 m; tuned KC-UKF holds about **3.45 m**. Leave-one-drive-out over 11 drives keeps the margin on held-out drives.

![Per-sensor behavior under spoof](https://raw.githubusercontent.com/Darth-Hidious/kc-ukf-nav/main/figures/fig_sensor_behavior.png)

In the plot above, GNSS R inflates hard while barometer and magnetometer stay near one. The filter stops trusting the bad channel instead of hard-switching it out.

## Drone

Same filter, no retune, MuJoCo Skydio X2: peak error ~27 m → ~2.9 m. CFE is a trust layer on a classical update, not a new filter per vehicle.

![CFE core schematic](https://raw.githubusercontent.com/Darth-Hidious/kc-ukf-nav/main/figures/fig_cfe_core.png)

## Reproduce

Each paper claim maps to one command (`process_kitti.py`, `kitti_scenarios.py`, `lodo_cv.py`, SymPy checks, pytest). KITTI raw is not in the repo; a download script pulls the official mirror. Checked-in result JSONs are the outputs of those commands.

Under review for IEEE NAVICON 2026. DOI: [10.5281/zenodo.19506045](https://doi.org/10.5281/zenodo.19506045).
