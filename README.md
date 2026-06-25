# Worldcaps

A comprehensive, interactive geography quiz game designed to test and expand players' knowledge of global capitals, regions, and boundaries. Built with a focus on visual precision, optimized local data pipelines, and a shared modular architecture.

---

## 📋 Overview

**Worldcaps** challenges players to navigate across 10 distinct global regions, identifying capital cities and mastering geographic data. Developed over the course of a year, the project operates on a fully refactored, highly stable, and unified codebase designed for cross-platform deployment from a single core repository.

* **Current Version:** 1.0.0
* **Developer:** J and S Productions[cite: 1, 2]
* **Target Environments:** Windows (Desktop Local Testing), Linux (Desktop Local Testing)

---

## 🚀 Key Architectural Features

* **10 Operational Regions:** Mostly complete coverage of the global map, seamlessly divided into dedicated, optimized gameplay regions[cite: 1, 2].
* **Modular Architecture:** Unified CSS and JavaScript structures that share core physics, states, and data logic across all map layouts[cite: 1, 2].
* **Pixel-Perfect Interface:** Rigid UI constraints and exact asset placement configurations to ensure layout stability across screen definitions[cite: 1, 2].
* **Performance Vector Pipelines:** Stripped, low-overhead inline SVGs engineered for fast DOM rendering and immediate client response[cite: 1, 2].

---

## 🎨 Graphics & Asset Attributions

### Regional Map Vectors
This project utilizes a custom-tailored suite of 10 regional SVG maps[cite: 1, 2]. 

The base geographic boundary vectors were originally sourced from public-domain and open-source vector repositories[cite: 1, 2]. To achieve a cohesive visual layout and high-performance execution within the game loop, these files were manually processed, stripped of heavy vector-editor metadata, and completely standardized via text and vector editors[cite: 1, 2].

Modifications include:
* Unifying stroke weights, borders, and scale formats across all 10 regions[cite: 1, 2].
* Synchronizing color hex palettes to natively match the game UI theme[cite: 1, 2].
* Optimizing path nodes and stripping metadata for fast, lightweight loading[cite: 1, 2].

*Every effort has been made to align these assets with public-domain usage. If you are an open-source creator who recognizes a base layout vector and wish to establish a specific attribution pointer, please reach out to the project maintainer[cite: 1, 2].*

---

## 🛠️ Setup & Local Testing Instructions

Because the application is written using core web native technologies, it uses wrapper toolchains to run locally on your desktop machine for evaluation and testing.

*************************
*     WINDOWS USERS     *
*************************

- Ensure you have Node.js installed on your machine.
- Open the root folder in your terminal (Command Prompt or PowerShell).
- Type `npm install` and press Enter (only needed the first time).
- Type `npm run start:electron` and press Enter to launch the game workspace[cite: 1, 2].
- ENJOY!

*************************
*      LINUX USERS      *
*************************

- Open root folder in terminal.
- Type `chmod +x start_worldcaps.sh`.
- Double-click `start_worldcaps.sh`.
- Click 'Run'.
- ENJOY!

---

## 🔒 License & Ownership

**Copyright © 2026 J and S Productions. All rights reserved.[cite: 1, 2]**

The entire core codebase, optimized SVG files, text-based datasets, layout structures, and visual branding elements of **Worldcaps** remain the exclusive intellectual property of the author[cite: 1, 2]. 

Unauthorized compilation, replication, distribution, or commercialization of these custom files or core concepts without explicit written verification from the copyright holder is strictly prohibited[cite: 1, 2]. Cryptographic development logs, version histories, and permanent commit timestamps are maintained as absolute proof of original authorship.
