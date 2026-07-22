---
title: Vingilot Mk01 — Code-CAD for a VTOL airframe
repo: Darth-Hidious/Vingilot.mk01.manta
slug: vingilot
excerpt: CadQuery modules for fuselage, wing, nacelle, empennage. Params in mm, STEP export, optional Onshape upload.
image: /notes/vingilot-modules.svg
date: 2026-02-15
order: 5
language: Python
---

Modular Code-CAD for a VTOL airframe. CadQuery builds each section from a shared parameter file, exports STEP, and can upload the hierarchy to Onshape.

![Modular layout](/notes/vingilot-modules.svg)

## Layout

- **fuselage** — main body
- **wing** — flying-wing surfaces
- **nacelle** — motor pods / tilt rotors
- **empennage** — tail
- **params.py** — dimensions (mm)
- **exports/** — STEP per module
- **upload_to_onshape.py** — hierarchical upload

## Workflow

```bash
python -m assemblies.fuselage.build
python upload_to_onshape.py fuselage
python upload_to_onshape.py --all
```

Deps: CadQuery, Onshape client, `python-dotenv`. Geometry lives in git; Onshape is an export target.
