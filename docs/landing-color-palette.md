# Landing color palette reference

Source of truth in code: `frontend/src/index.css` (`@theme` + `:root` caramel / `--landing-*` tokens).

**Active palette:** New (refined caramel) — applied July 2026.

---

## New (current)

Refined caramel for softer surfaces, clearer soft-fill separation, and slightly deeper primary for contrast.

| Role | Token | Hex | Notes |
|------|--------|-----|--------|
| Surface / cream | `--landing-cream` / caramel-50 | `#FDF4EB` | Slightly warmer, softer base |
| Soft fill | caramel-100 | `#F9E4D4` | Better separation from cream |
| Light accent | caramel-200 | `#F3C69D` | Borders, dividers, disabled |
| Mid steps | caramel-300 / 400 | `#EEA86A` / `#E89035` | Interpolated ramp |
| Primary orange | `--landing-accent` / caramel-500 | `#E87400` | Deeper for contrast on white |
| Hover | `--landing-accent-hover` / caramel-600 | `#C66300` | Clean step from primary |
| Deep accent | `--landing-accent-dark` / caramel-700 | `#904400` | Active / icon accents |
| Deep brown | caramel-800 | `#5C2C00` | Ramp filler |
| Body text | `--landing-text` / caramel-900 | `#351E08` | Espresso brown |
| Ink | `--landing-ink` / caramel-950 | `#1F1003` | Headings |

Full ramp (new):

```
#FDF4EB → #F9E4D4 → #F3C69D → #EEA86A → #E89035 → #E87400 → #C66300 → #904400 → #5C2C00 → #351E08 → #1F1003
```

---

## Old (previous)

Original light-caramel landing palette before the July 2026 refinement.

| Role | Token | Hex |
|------|--------|-----|
| Surface / cream | `--landing-cream` / caramel-50 | `#FDF2E7` |
| Soft fill | caramel-100 | `#FCE6CF` |
| Light accent | caramel-200 | `#F8CCA0` |
| Mid | caramel-300 / 400 | `#F5B370` / `#F29940` |
| Primary orange | `--landing-accent` | `#EE8011` (`@theme` also had `#EF7A00`) |
| Hover | `--landing-accent-hover` | `#BF660D` |
| Deep accent | `--landing-accent-dark` | `#8F4C0A` |
| Deep brown | caramel-800 | `#5F3307` |
| Body text | `--landing-text` | `#301A03` |
| Ink | `--landing-ink` | `#211202` |

Full ramp (old):

```
#FDF2E7 → #FCE6CF → #F8CCA0 → #F5B370 → #F29940 → #EE8011 → #BF660D → #8F4C0A → #5F3307 → #301A03 → #211202
```

---

## Side-by-side

| Role | Old | New |
|------|-----|-----|
| Cream | `#FDF2E7` | `#FDF4EB` |
| Soft fill | `#FCE6CF` | `#F9E4D4` |
| Light accent | `#F8CCA0` | `#F3C69D` |
| Primary | `#EE8011` | `#E87400` |
| Hover | `#BF660D` | `#C66300` |
| Deep | `#8F4C0A` | `#904400` |
| Body text | `#301A03` | `#351E08` |
| Ink | `#211202` | `#1F1003` |

Same orange-caramel family; new values are a polish for contrast and surface separation, not a new color story.

---

## Related tokens (unchanged / non-landing)

Defined in the same `:root` block but not part of this caramel swap:

| Token | Hex | Use |
|-------|-----|-----|
| `--nic-green` | `#4B8AEA` | NIC chrome |
| `--gov-blue` | `#0D47A1` | Dashboard |
| `--nic-bg` | `#F8F8F8` | App page background |
| `--nic-text` | `#333` | Default body outside landing |

---

## Restore old palette

If you need to roll back, set caramel / `--landing-*` values in `frontend/src/index.css` to the **Old** table above, and update any hardcoded hexes in `frontend/src/components/landing/*.jsx` SVGs (`#e87400` → `#ee8011`, `#f9e4d4` → `#fce6cf`, `#fdf4eb` → `#fdf2e7`, `#c66300` → `#bf660d`, `#904400` → `#8f4c0a`).
