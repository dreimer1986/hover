# Neon Causeway lighting — 0.5.2

Only Neon Causeway receives the new per-material shaders and derived cyan/magenta emissive masks. Source artwork and archived releases are unchanged. The near-field lighting remains stronger than distant ambient light; the arena is not uniformly bright. Spatial lamps/dynamic shadows remain a separate TODO.

Validation on 2026-11-24, Chromium/SwiftShader:

- `neon_lighting_smoke.cjs`: compare the same stationary staircase approach before/after in Modern, Retro and forced ARM/simplified rendering. All shader programs link without browser errors. Starting City afterwards restores its unmodified shader selection.
- Mean luminance of the sampled lower ground region (0–255): Modern 37.4 → 65.5; Retro 87.6 → 91.5; simplified/mobile 25.3 → 57.0. These values describe this one test view, not a general display-brightness guarantee.
- Visual review: [before](neon-lighting-before.png), [after](neon-lighting-after.png). Roads/stairs remain readable with a dark skyline and distant surfaces.
- Two-client Neon Causeway rounds: Modern/3 flags and Retro/6 flags, movement replication, all captures, persistent lobby and final scores passed. No browser errors or missing assets.
- Archive: 3,649 integrity checks passed. Physical phone displays remain a user acceptance check.
