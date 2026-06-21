# Inside Black Boxes — Website

Static podcast website for **Inside Black Boxes**, built with [Vite](https://vitejs.dev/).

## Preview on your Mac

You have two ways to preview the site locally. **Option A works immediately** — every Mac has Python built in.

### Option A — Quick preview (no install required)

1. Open **Terminal** (`Cmd + Space`, type **Terminal**, press Enter).
2. Copy and paste this entire block, then press Enter:

```bash
cd ~/Projects/inside-black-boxes/website
python3 -m http.server 8080
```

3. Open **Safari** or **Chrome** and go to:

```
http://localhost:8080/
```

4. Click around:
   - **Home** — `http://localhost:8080/`
   - **Episodes** — `http://localhost:8080/episodes.html`
   - **About** — `http://localhost:8080/about.html`
   - **Featured episode** — `http://localhost:8080/episodes/urias-orellana.html`

5. When you're done, return to Terminal and press **Ctrl + C** to stop the server.

### Option B — Vite dev server (optional, for development)

If you install [Node.js](https://nodejs.org/) (LTS version), you can use the faster Vite dev server:

```bash
cd ~/Projects/inside-black-boxes/website
npm install
npm run dev
```

Open the URL shown in Terminal (usually `http://localhost:5173/`).

To build for production hosting:

```bash
npm run build
npm run preview
```

## Project structure

```
website/
├── index.html              # Homepage
├── episodes.html           # Episode archive + case tracker
├── about.html              # About Marty Robles-Avila
├── episodes/
│   └── urias-orellana.html # Featured episode detail
└── src/
    ├── data/site.js        # Episodes, tracked cases, host info
    ├── js/                 # Layout and rendering
    └── styles/main.css     # Design system
```

## Editing content

Update `src/data/site.js` to add episodes or change tracked cases. Episode detail pages can be added under `episodes/` and registered in `vite.config.js`.
