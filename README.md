# 🛡️ Sri Lanka Strategic Defense Grid (SL-IADS)

An advanced, high-fidelity geospatial Integrated Air Defense System (IADS) simulator and optimizer specifically designed for the Sri Lankan topography.

**🔗 Live Site:** [https://air-defense.ishanoshada.com](https://air-defense.ishanoshada.com)

---

## 📖 Overview

The **Sri Lanka Strategic Defense Grid** is a specialized strategic simulation tool developed for defense analysts and enthusiasts to model, optimize, and stress-test national air defense configurations. Leveraging real-world geospatial data and complex intercept geometry, the application provides a visual and data-driven approach to understanding multi-layered defense architecture.

The platform uses a sophisticated **Solver Engine** to calculate coverage metrics across thousands of sampling points, ensuring that strategic assets are placed with mathematical precision to protect high-value urban centers, coastal regions, and inland infrastructure.

---

## 🚀 Key Features

### 1. Advanced Geospatial Mapping
*   **Real-time Leaflet Integration:** Utilizes high-performance raster tiles and GeoJSON data of Sri Lanka.
*   **Topographic Awareness:** Strategic locations like Pidurutalagala and Dondra Head are pre-mapped for rapid tactical deployment.
*   **Dynamic Range Visualization:** Real-time rendering of radar detection envelopes and interceptor engagement zones.

### 2. The Solver Engine (Automated Optimization)
*   **Spatial Maxima Search:** A brute-force genetic algorithm that mutates deployment configurations to maximize a weighted score based on land, urban, and sea priorities.
*   **Multi-Objective Optimization:** Balances capital cost ($M) against defensive coverage (%).
*   **Target Milestones:** Set a target coverage percentage (e.g., 95%) and let the engine solve for the most cost-effective placement.

### 3. Live Attack Simulator
*   **Point-and-Click Engagement:** Manually set launch points and target vectors directly on the map.
*   **Hyper-Lock Interception Logic:** Real-time calculation of intercept vectors based on missile velocity and interceptor shot speed.
*   **Strike Packages:** Launch "Scout" or "Full-Scale" automated strike packages to test grid integrity under fire.

### 4. Interactive Tactical Guide
*   **Mathematical Logic:** Access real-time formulas used for intercept geometry and spatial sampling.
*   **Bilingual Support:** Full instructions and logic documentation in both **English** and **Sinhala (සිංහල)**.
*   **Usage Instructions:** Detailed steps for deploying assets, running simulations, and exporting strategy bundles.

---

## 📂 Project Structure

The codebase is organized into a clean, modular architecture:

*   `components/`: UI modules including `AttackSimulator.tsx`, `StressTest.tsx`, `WelcomeModal.tsx`, and `AboutPanel.tsx`.
*   `engine/`: Core logic and mathematical algorithms (e.g., `SolverEngine.ts`).
*   `locales/`: Internationalization files (`translations.ts`) for dual-language support.
*   `App.tsx`: Main application container and state management.
*   `constants.ts`: Global configuration, SAM/Radar templates, and geographic data.
*   `types.ts`: TypeScript interfaces and type definitions.

---

## 🏗️ Technical Implementation Details

### Interception Geometry
The simulator uses a kinematic approach. When a threat is detected, the system solves the quadratic equation for the intercept point:
`Vt²t² + 2(Vt·D)t + |D|² = Vi²t²`
where `Vt` is threat velocity, `Vi` is interceptor velocity, and `D` is the initial displacement.

### Coverage Calculation
The `SolverEngine` divides the Sri Lankan bounding box into a 3,600-point grid. Each point is tested for:
1.  **In-Country Logic:** Ray-casting algorithm on the national GeoJSON boundary.
2.  **Dual-Layer Coverage:** Verification of both Radar Detection and Kinetic Engagement capability.
3.  **Urban Weighting:** Strategic cities carry a higher "weight" in the final defensive score.

---

## 🌍 UX & Persistence

*   **Welcome Onboarding:** A detailed introductory modal explaining app functionality, shown once every 24 hours (managed via `localStorage`).
*   **Zen Mode:** Hide all UI overlays for a focused tactical map view.
*   **Strategy Bundles:** Import and export your entire grid configuration as portable `.json` files.
*   **Educational Purpose Only:** All hardware specifications are based on public domain data for simulation and educational use.

---

## 🧑‍💻 Developer Setup

1.  **Clone the repository.**
2.  **Install dependencies:** `npm install`
3.  **Run development server:** `npm run dev`
4.  **Build for production:** `npm run build`

---

## 📄 License & Attribution

Designed and engineered by **Ishan Oshada**.
The project is intended for educational purposes, utilizing public domain hardware specifications.

**Website:** [ishanoshada.com](https://www.ishanoshada.com/)  
**GitHub:** [github.com/ishanoshada/National-Defense-Grid](https://github.com/ishanoshada/National-Defense-Grid)

---
*Operational Readiness: 100%. Grid Secure.*