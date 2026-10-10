# XPresence story homepage (design preview)

A story-led homepage concept for XPresence Eau de Parfum. This is a design preview, not the live store.

The page follows a day in the life of two characters. Each fragrance is revealed through scroll inside a chapter of that day: Focus (09:15), Power (14:30), Warmth (21:00), then the Discovery Set.

## Run it

It's a static page. Serve the folder and open it in a browser:

```bash
python -m http.server 5641
```

Then visit http://localhost:5641.

## What's here

- `index.html`: the whole page (HTML, CSS and JS in one file). It uses GSAP and ScrollTrigger from cdnjs, Lenis from unpkg, and Google Fonts.
- `assets/`: compressed creatives (WebP) and films (MP4).
- `DESIGN.md`: the design system the page is built to (a Bugatti-inspired analysis used as design language only), plus an "XPresence Adaptation" section covering font substitutes and deliberate departures.
