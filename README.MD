# Nishita Kumari — Portfolio

A personal portfolio site built as a static page — no build step, no framework.
It's themed as a night sky with a small cat mascot that wanders between grassy
ledges fixed to the screen edges while the actual content (About, Education,
Projects, Work, Stack, Contact) scrolls through the middle.

## Structure

- `index.html` — page markup and section layout
- `styles.css` — all styling, including the night-sky background, ledges, and animations
- `data.js` — portfolio content (education, tech stack, projects, experience, contact links) as one editable data object
- `script.js` — scroll/reveal behavior, nav, and rendering `data.js` into the page
- `cat.js` — the cat mascot: movement, ledge-hopping, and its animations
- `desksprite/` — local reference repo (ignored, not part of the site)

## Editing content

All real content (education, tech stack, projects, work, contact links) lives
in `data.js` — update the placeholder strings there; nothing else needs to
change.

## Running locally

No build tools required. Serve the folder with any static server, e.g.:

```
python -m http.server 8000
```

then open `http://localhost:8000`.
