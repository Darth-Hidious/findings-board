---
title: Vingilot Mk01 — modular Code-CAD for a VTOL airframe
repo: Darth-Hidious/Vingilot.mk01.manta
slug: vingilot
excerpt: CadQuery modules for fuselage, wing, nacelle, and empennage, parameterized in millimeters and pushed as STEP into Onshape — aircraft geometry as code, not a one-off CAD session.
image: /notes/vingilot-modules.svg
date: 2026-02-15
order: 5
language: Python
---

Vingilot Mk01 is a modular Code-CAD workflow for a VTOL airframe: CadQuery builds each major section from a shared parameter file, exports STEP, and optionally uploads the hierarchy into Onshape.

![Modular fuselage, wing, nacelle, and empennage layout](/notes/vingilot-modules.svg)

## Layout

The repo is organized the way you actually touch the airplane:

- **fuselage** — main body module
- **wing** — flying-wing surfaces
- **nacelle** — motor pods / tilt rotors
- **empennage** — tail section
- **params.py** — master dimensions (all mm)
- **exports/** — generated STEP per module
- **upload_to_onshape.py** — hierarchical upload

## Workflow

Build one module:

```bash
python -m assemblies.fuselage.build
```

Push to Onshape (single module or everything):

```bash
python upload_to_onshape.py fuselage
python upload_to_onshape.py --all
```

Dependencies are deliberately small: CadQuery, the Onshape client, and `python-dotenv` for API keys. Geometry stays in git as code; the CAD cloud is a publishing target, not the source of truth.

## Why it is here

Aerospace prototypes die in unnamed SolidWorks features. Vingilot is the opposite bet: parameters and assemblies that can be rebuilt, diffed, and handed to a manufacturing or CFD step without reconstructing the model from memory.
