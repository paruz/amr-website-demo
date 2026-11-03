# א.מ.ר חומרי בניין — demo website

Clickable mockup of a website for a building-materials, tools and home-goods store in Hadera.
All texts, products, address, hours and contact details are placeholders; buttons for WhatsApp,
phone and Waze show a demo notice instead of opening anything.

- `index.html` — home: brick-wall load sequence, caution-tape marquee, horizontal category reel,
  contractor steps, store visit section. Scroll progress is shown as a tape measure.
- `catalog.html` — product catalog with department filters, search and a price-request list.

Static HTML/CSS/JS, no build step. Motion: GSAP + ScrollTrigger, Lenis smooth scroll
(respects `prefers-reduced-motion`). Fonts: Heebo and Karantina (Google Fonts, SIL OFL).

Run locally:

```bash
python -m http.server 8765
```
