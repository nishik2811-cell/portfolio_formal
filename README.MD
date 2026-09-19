# Nishita Kumari — Portfolio

A personal portfolio site built as a static page — no build step, no framework.
It's themed as a night sky with a small cat mascot that hops between grassy
ledges fixed to the screen edges while the actual content (About, Education,
Projects, Work, Stack, Contact) scrolls through the middle.

## Structure

- `index.html` — page markup and section layout
- `styles.css` — all styling: the night-sky background, ledges, shooting stars, and animations
- `data.js` — portfolio content (education, tech stack, projects, experience, contact links) as one editable data object
- `script.js` — scroll/reveal behavior, nav, and rendering `data.js` into the page
- `cat.js` — the cat mascot: movement, ledge-hopping, and its animations
- `assets/` — project screenshots referenced from `data.js` (`image` field on each project/currently-working entry)
- `resume.pdf` — the file every "Resume" link/button on the site points to
- `desksprite/` — local reference repo (ignored, not part of the site)

## Editing content

All real content (education, tech stack, projects, currently working on,
experience, contact links) lives in `data.js` — edit it there; nothing else
needs to change for text content.

Project and currently-working cards render as a plain box, or as a whole
clickable `<a>` card when the entry has a `github` and/or `demo` URL (see
`renderProjects`/`renderCurrent` in `script.js`) — there's no separate "Code"
link, the whole card is the link. Drop a screenshot in `assets/` and point
an entry's `image` field at it to show it on the card.

## Cache-busting

`index.html` loads `styles.css`, `data.js`, `script.js`, and `cat.js` with a
manual `?v=YYYYMMDDx` query string. Bump the version on whichever file(s) you
change — otherwise browsers (including your own local preview) will keep
serving the previously cached copy instead of your edit.

## Running locally

No build tools required. Serve the folder with any static server, e.g.:

```
python -m http.server 8000
```

then open `http://localhost:8000`.
