# Personal Portfolio / Business Card

## Introduction

This repository is a **single-page portfolio website**: a digital business card with an animated sky (day/night, sun, moon, stars), optional weather-driven effects (clouds, rain, snow, thunder), and an interactive card you can expand to show **About / Portfolio**, **Resume**, and project sections. It is built with plain **HTML**, **CSS**, and a small amount of **JavaScript**, and is a good fit for hosting on **GitHub Pages** or any static file host.

---

## Project layout

| Path | Purpose |
|------|---------|
| `index.html` | Page structure, text, links, images, and section content |
| `css/styles.css` | Layout, colors, typography, animations |
| `js/script.js` | Card navigation, sky/weather, moon phase, PDF export, easter eggs |
| `assets/` | Resume PDF, project images, and other static files |
| `.nojekyll` | Tells GitHub Pages not to run Jekyll (helps static sites serve correctly) |

---

## How to edit your site

Most copy and links live in **`index.html`**. Open it in a text editor and search for the sections below.

### Page title and SEO

- In the `<head>`, update **`<title>`** and the **`<meta name="description">`** with your name and a short tagline.

### Main card (first screen)

Inside **`#card-main`** (search for `card-main`):

- **Profile photo** — the `<img class="card-photo">` `src` (use a URL or a file under `assets/`, e.g. `./assets/photo.jpg`).
- **Name** — `<h1 class="card-name">`.
- **Title / subtitle** — `<p class="card-title">`.
- **Phone** — the text inside `.card-phone` (keep or remove the line if you prefer email only).
- **Email** — the `mailto:` link and visible text on `.card-email`.

### GitHub and LinkedIn

Still in **`index.html`**, find **`card-links-grid`**. Edit the **`href`** on:

- the link with **GitHub** label (currently an `<a>` with `aria-label="GitHub"`),
- the link with **LinkedIn** label (`aria-label="LinkedIn"`).

**Portfolio** and **Resume** use `href="#"` and special `data-section` attributes—leave those as-is unless you change how sections work in `script.js`.

### About / Portfolio section

Search for **`card-section-about`** and **`about-panel-about`**. Replace placeholder text under Bio, Education, Certification, Interest, and Skills. Update the **About** profile image (`class="about-photo"`) the same way as the main card photo.

**Personal Projects** and **Academic Projects** live in **`#about-panel-personal`** and **`#about-panel-academic`**. Each project block uses headings, timeline, blurbs, and the **What / How / Result** figures.

### Project images (What / How / Result)

Shared images are in **`assets/`**:

- `project-the-what.png`
- `project-the-how.png`
- `project-the-result.png`

Replace those files (same filenames) or change each `<img src="...">` in `index.html` to point at new paths under `assets/`.

### Resume

- Put your PDF at **`assets/resume.pdf`** (replace the existing file), **or** change every `./assets/resume.pdf` reference in `index.html` to your filename.
- The **Download** button uses the `download` attribute; you can change the downloaded filename there (e.g. `download="Your_Name_Resume.pdf"`).

### Styling (colors, fonts, spacing)

Edit **`css/styles.css`**. Root variables near the top (`:root`) control many colors; the rest of the file handles layout and animations.

### Behavior (optional)

**`js/script.js`** drives weather (Open-Meteo), time of day, card expand/collapse, About tabs, PDF export, and small easter eggs. Change only if you need different behavior.

---

## Preview locally

From the project folder:

```bash
npx --yes serve . -p 3000
```

Then open `http://localhost:3000` in your browser.

---

## Credits & Licenses

### Resume template

The resume template used in this project is based on the **Harvard resume template** (bullet points format). Credit to Harvard for the template design.

### Weather

This project uses the **Open-Meteo** weather API and/or code from the Open-Meteo project.  
Open-Meteo is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

- [Open-Meteo](https://open-meteo.com/) — weather data API (no API key required)

### PDF export (Portfolio → Export)

The in-browser **Export** button uses **html2pdf.js** (bundles jsPDF and html2canvas) loaded from a CDN. See the [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) repository for its license (MIT).

---

## License

This project’s own code and assets are separate from the credited works above. See the credited projects for their respective terms (e.g. AGPL-3.0 for Open-Meteo).
