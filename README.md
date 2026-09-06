# duuberian.com

The independent home of **https://duuberian.com**. This repository owns the website and custom domain.

## Preview locally

```sh
python3 -m http.server 8765
```

Open http://localhost:8765. No build step or package install is required.

## Structure

- `index.html` and `home-assets/`: the homepage, GSAP motion, Three.js sculpture, and local drawing playground.
- `elwifi/`: the published ELWifi product site, downloads, and signed update feed. The separate `duuberian/ELWifi` application repository publishes only this folder using its dedicated deploy key.
- `CNAME`: the custom domain `duuberian.com`.
- `.nojekyll`: serve the static files directly.
- Root `assets/`, `downloads/`, `script.js`, and `styles.css` preserve legacy ELWifi asset/download URLs.

GitHub Pages publishes `main` from the repository root. Push homepage edits directly here. The ELWifi release pipeline preserves the homepage and all other root files.

## Homepage features

Interactive, pointer-responsive 3D sculptures with three shape variants; GSAP entrance and scroll reveals; handwritten SVG details; responsive project cards; a keyboard-accessible project preview; and a drawing playground with local PNG export. Drawing data stays in the browser tab.

Reduced motion and an explicit pause control are supported. 3D rendering pauses offscreen and in hidden tabs. A static illustration remains if WebGL is unavailable, and core text and links work without JavaScript.

## Libraries

- Three.js 0.180.0, vendored under `home-assets/vendor/`; MIT license included.
- GSAP 3.13.0, vendored with its license notice retained. Terms: https://gsap.com/standard-license/.
- Manrope, DM Mono, and Nothing You Could Do via Google Fonts, with fallback fonts.

Before publishing design changes, check phone/tablet/desktop layouts, drawing/export, the shape controls, reduced motion, keyboard navigation, and the `/elwifi/` download and update URLs.
