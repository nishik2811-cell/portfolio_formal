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

## The cat

`cat.js` draws and animates the mascot living on the ledges. A few things
it actually does:

- **Wanders on its own** — idles, sits, sleeps, stretches, and grooms on a
  randomized timer, then walks to a ledge edge and jumps to another one,
  entirely decoupled from scrolling.
- **Watches your cursor** — its eyes and head track the pointer continuously
  on devices with a real mouse; occasionally, while idle or sitting, it'll
  walk toward it.
- **Click to pet** — click the cat and it closes its eyes and gives a happy
  little tail curl and wag.
- **Reacts to landing** — the ledge it lands on gives a small settle bounce
  and its hanging vines sway.
- **Respects `prefers-reduced-motion`** — the idle loop and cursor-tracking
  both turn off for anyone who's asked for reduced motion.

It's drawn as scalable canvas vector shapes rather than pixel-art frames, so
it stays crisp at any size. The behavior state machine (idle/walk/jump/land
loop, resize handling) is adapted from the open-source
[desksprite](https://github.com/welltilln/desksprite) (MIT); the renderer
itself is original.

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
