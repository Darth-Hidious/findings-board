---
title: KC-UKF on real KITTI — spoof-resilient GNSS/INS
repo: Darth-Hidious/kc-ukf-nav
slug: kc-ukf-nav
excerpt: Cross-sensor trust inside a classical UKF. On KITTI drive 0001 with a ~47 m GPS spoof, a conventional filter drifts to 61 m; KC-UKF holds 1.9 m — no discrete fault switch, every constant named.
image: https://raw.githubusercontent.com/Darth-Hidious/kc-ukf-nav/main/figures/fig_real_kitti.png
date: 2026-05-20
order: 2
language: Python
---

A spoofed sensor rarely looks wrong alone. It looks wrong against the model’s prediction and against the other sensors. **KC-UKF** is an error-state unscented Kalman filter whose measurement update scales each sensor’s noise covariance by a cross-sensor compatibility score (CFE — Compatibility-Field Estimation).

![KC-UKF rejecting a GPS spoof on real KITTI data](https://raw.githubusercontent.com/Darth-Hidious/kc-ukf-nav/main/figures/fig_real_kitti.png)

## The idea in one breath

Per-sensor NIS is scored against the *baseline* noise model → Gaussian compatibility → softmax consensus across sensors → per-sensor R-inflation, inside one classical UKF update. No discrete fault decision. No learning in the loop at runtime. Every constant is named and bounded. A small supervised network can set those constants automatically so you are not hand-searching every scenario.

## What shows up on KITTI

On drive 0001 with an injected ~47 m GPS spoof on the recorded signals:

- Conventional UKF is dragged to about **61 m** error.
- KC-UKF holds about **1.9 m**.

The decisive case is a slow drift whose per-step increment stays below the GNSS noise floor. Per-sensor adaptive filters (including Sage–Husa) follow it to roughly 12 m; tuned KC-UKF holds about **3.45 m**. Leave-one-drive-out over 11 drives keeps the margin on drives never seen while setting constants.

![Per-sensor behavior under spoof](https://raw.githubusercontent.com/Darth-Hidious/kc-ukf-nav/main/figures/fig_sensor_behavior.png)

In the mechanism plot above, GNSS R inflates by orders of magnitude while barometer and magnetometer stay near one — the filter does not “vote out” a sensor with a hard switch; it stops believing the bad channel.

## Same filter, different platform

The drone demo (MuJoCo Skydio X2) reuses the same filter without retuning and cuts peak error from about 27 m to about 2.9 m. That is the point of keeping the update classical: the CFE layer is a trust modulator, not a new architecture per vehicle.

![CFE core schematic](https://raw.githubusercontent.com/Darth-Hidious/kc-ukf-nav/main/figures/fig_cfe_core.png)

## Reproducing without folklore

The repo maps each paper claim to a single command (`process_kitti.py`, `kitti_scenarios.py`, `lodo_cv.py`, SymPy math checks, full pytest). KITTI raw is not redistributed; a download script pulls the official mirror. Result JSONs checked into the tree are the files those commands produce.

Paper status: under review for IEEE NAVICON 2026. Companion DOI: [10.5281/zenodo.19506045](https://doi.org/10.5281/zenodo.19506045).
