# BitFest 4.0 Green

The look of the BitFest 4.0 website (KUET CSE Innovation Fest, 5–6 February 2027): slate blue pages, one emerald accent, and light that glows up from below like a powered circuit board. This is the green theme that replaced the old orange site.

Motto: AI for Mankind, Society and the Sustainable Development Goals.

## Voice

- Plain and factual. Say the contest, the day and the prize: "Capture The Flag · 6 Feb · 70K BDT".
- Sentence case everywhere. The only uppercase is the logo and the `KUET CSE INNOVATION FEST` ticker.
- No em dashes. Use a middle dot (·) between facts on one line.
- Unknown amounts show as `??`, never a guess.

## Colour

The site is dark only. Three layers make every screen:

1. **Ground**: `bg` (#18283f). Panels step up to `panel`, insets step down to `lid`.
2. **Text**: `ink` for headings, `soft` for body, `muted` for nav and captions. `cream-hi` is the brightest, kept for the logo lettering, prize figures and button labels.
3. **Accent**: `green` (#22c55e), and only one thing at a time should wear it: the active pin, a hover, a focus ring, a wire, a dot.

Light is the signature. The glow ramp `light-0` to `light-7` runs white-green through green and teal into blue, and is drawn as a radial gradient rising from the bottom edge of the hero, the buttons and the chip. Use the ramp in that order; never flip it.

Gradients in use:

| Name | Stops | Where |
| --- | --- | --- |
| Motto | `green-hi` → `green` (45%) → `cream-hi`, 100° | The motto line |
| Prize shimmer | `cream-hi` with a `green-hi` / `green` band passing through | Prize pool after it rolls |
| Glow | `light-0` → `light-7`, radial | Bottom light, button hover sheen |
| Logo | `logo-top` → `logo-bottom`, top to bottom | The logo mark and badge |

Contrast: `dim` is 3.6:1 on `bg`, below the 4.5:1 text minimum. It is used today for the small "Pin 01 · Programming" labels; move anything a reader needs to `muted`.

## Type

- **Geist** (Google Fonts) for everything on the site: headings at weight 600 with tight tracking (-0.04em at section size), body at 400.
- **Orbitron** at 900 only inside the logo for "BITFEST 2027". Never set headings in it.
- Numbers in prizes, pins and dates use tabular figures.

Load Geist from Google Fonts: `https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap` (the site loads it through `next/font/google`).

## Shape and space

- Page gutter: `space-6` on phones, `space-14` from tablet up. Content caps at 1440px.
- Nav is `nav-height` tall and fixed; heroes start under it and fit one screen.
- Corners: `radius-md` buttons, `radius-lg` photo tiles, `radius-xl` cards, `radius-2xl` the big hero panel.
- A faint dot grid (22px pitch, `ink` at 7%) sits behind heroes.

## Components on the site

These live in the codebase (`components/redesign`), not in this system yet:

- **Button**: `lid` face, `cream-hi` label, a 1px `rim` edge at 30%, an arrow cell on the right; on hover the glow ramp slides in from the bottom left. `shadow-button` under it.
- **Chip hero**: a circuit-board chip with ten pins (one per contest). The title "BitFest 4.0", the dates above it, the prize pool rolling at its foot. The active pin's wire and name turn `green`.
- **Name ticker**: a `lid` box with a `green` 28% edge beside the logo; `KUET CSE INNOVATION FEST` scrolls through it with green dots between.
- **Prize strip**: one row of prize-night photos in `radius-lg` tiles, framed in a darker `bg`, scrolling slowly.

## Logos

See the Logos asset group. Use the gradient logo on `bg`; the flat green version where a gradient can't print.
