// ---------------------------------------------------------------------------
// Content rendering — reads PORTFOLIO_DATA (data.js) into the DOM.
// ---------------------------------------------------------------------------

function renderStack() {
  const root = document.getElementById("stackList");
  root.innerHTML = PORTFOLIO_DATA.techStack
    .map(
      (group) => `
      <div class="stack__row reveal">
        <span class="stack__category">${group.category}</span>
        <ul class="stack__items">
          ${group.items.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>`
    )
    .join("");
}

function renderProjects() {
  const root = document.getElementById("projectsList");
  root.innerHTML = PORTFOLIO_DATA.projects
    .map(
      (p) => `
      <article class="project reveal">
        <h3 class="project__name">${p.name}</h3>
        <div class="project__body">
          <p class="project__desc">${p.description}</p>
          <ul class="project__tech">
            ${p.tech.map((t) => `<li>${t}</li>`).join("")}
          </ul>
          <div class="project__links">
            ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener">Code</a>` : ""}
            ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener">Live demo</a>` : ""}
          </div>
        </div>
      </article>`
    )
    .join("");
}

function renderCurrent() {
  const root = document.getElementById("currentList");
  root.innerHTML = PORTFOLIO_DATA.currentlyWorking
    .map(
      (c) => `
      <div class="current__item reveal">
        <span class="current__number">${c.number}</span>
        <div>
          <h3 class="current__title">${c.title}</h3>
          <span class="current__category">${c.category}</span>
          <p class="current__desc">${c.description}</p>
        </div>
        <span class="current__status">${c.status}</span>
      </div>`
    )
    .join("");
}

function renderExperience() {
  const root = document.getElementById("experienceList");
  root.innerHTML = PORTFOLIO_DATA.experience
    .map(
      (e) => `
      <div class="experience__item reveal">
        <span class="experience__period">${e.period}</span>
        <div>
          <h3 class="experience__role">${e.role}</h3>
          <p class="experience__desc">${e.description}</p>
        </div>
        <span class="experience__org">${e.org}</span>
      </div>`
    )
    .join("");
}

function renderContact() {
  const root = document.getElementById("contactLinks");
  const { email, github, linkedin } = PORTFOLIO_DATA.contact;
  root.innerHTML = `
    <a href="mailto:${email}">${email}</a>
    <a href="${github}" target="_blank" rel="noopener">GitHub</a>
    <a href="${linkedin}" target="_blank" rel="noopener">LinkedIn</a>
  `;
}

renderStack();
renderProjects();
renderCurrent();
renderExperience();
renderContact();

// ---------------------------------------------------------------------------
// Navigation — solid background on scroll, mobile menu toggle.
// ---------------------------------------------------------------------------

const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navMobile = document.getElementById("navMobile");

function updateNavSolidity() {
  nav.classList.toggle("is-solid", window.scrollY > 40);
}
updateNavSolidity();
window.addEventListener("scroll", updateNavSolidity, { passive: true });

function closeMobileNav() {
  navMobile.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
}

navToggle.addEventListener("click", () => {
  const isOpen = navMobile.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

navMobile.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", closeMobileNav)
);

// ---------------------------------------------------------------------------
// Reveal-on-scroll — one subtle fade/slide-in per element, first time only.
// ---------------------------------------------------------------------------

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ---------------------------------------------------------------------------
// Cinematic background video — a single fixed, full-viewport <video> behind
// the whole page (see .bg-video in styles.css). Overall page scroll drives
// video.currentTime in three phases:
//
//   1. Hero        — scrolling through the hero plays the video's opening.
//   2. Cinematic beat — a short scroll distance right after the hero where
//      the video holds close to that opening moment (a small drift, not a
//      hard freeze) before continuing — the "~1.5s breathing room" beat.
//   3. Rest of page — About → Contact map across the remainder of the video,
//      ending near its final frames at Contact.
//
// Performance notes (this replaced an earlier version that visibly lagged):
//   - No getBoundingClientRect() in the hot path. That forces a synchronous
//     layout on every call; done every animation frame while scrolling, it
//     was the main source of the stutter. Section heights are measured once
//     on load/resize instead, and the per-frame math is pure arithmetic on
//     cached numbers + window.scrollY.
//   - video.currentTime is only ever written when it would actually change
//     by a meaningful amount (a fraction of a frame). Writing it on every
//     wheel/scroll tick — even by thousandths of a second — still asks the
//     browser to reseek/redecode for no visible difference.
//   - Scroll events themselves are coalesced into rAF via the `ticking`
//     flag, so a burst of wheel events collapses into one update per frame.
// ---------------------------------------------------------------------------

const video = document.getElementById("bgVideo");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const HOLD_FRACTION = 0.18; // % of video duration reached by the end of the hero
const DRIFT_FRACTION = 0.02; // tiny extra progress allowed during the cinematic beat
const MIN_TIME_DELTA = 1 / 60; // skip writes smaller than this — no visible difference

let duration = 0;
let heroHeight = window.innerHeight;
let pausePx = window.innerHeight * 0.6; // scroll distance the "beat" occupies
let scrollableHeight = 0;
let ticking = false;

function measure() {
  const hero = document.getElementById("home");
  heroHeight = hero ? hero.offsetHeight : window.innerHeight;
  pausePx = window.innerHeight * 0.6;
  scrollableHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
}

video.addEventListener("loadedmetadata", () => {
  duration = video.duration || 0;
  onScroll();
});

function computeTargetTime() {
  if (!duration) return 0;

  const scrollY = window.scrollY;
  const holdTime = duration * HOLD_FRACTION;
  const pauseEnd = heroHeight + pausePx;

  if (scrollY <= heroHeight) {
    return (scrollY / heroHeight) * holdTime;
  }

  if (scrollY <= pauseEnd) {
    const p = (scrollY - heroHeight) / pausePx;
    return holdTime + p * duration * DRIFT_FRACTION;
  }

  const startTime = holdTime + duration * DRIFT_FRACTION;
  const restDistance = Math.max(scrollableHeight - pauseEnd, 1);
  const p = Math.min((scrollY - pauseEnd) / restDistance, 1);
  return startTime + p * (duration - startTime);
}

// Self-perpetuating rAF loop: keeps easing video.currentTime toward the
// scroll-derived target every frame until it converges, so momentum/inertia
// scrolling (and the tail end of a single wheel notch) stays smooth instead
// of stalling between scroll events.
function step() {
  if (!duration) {
    ticking = false;
    return;
  }
  const target = computeTargetTime();
  const diff = target - video.currentTime;

  if (prefersReducedMotion) {
    if (Math.abs(diff) > MIN_TIME_DELTA) video.currentTime = target;
    ticking = false;
    return;
  }

  const next = video.currentTime + diff * 0.2;
  if (Math.abs(next - video.currentTime) > MIN_TIME_DELTA) {
    video.currentTime = next;
  }

  if (Math.abs(diff) > 0.02) {
    requestAnimationFrame(step);
  } else {
    ticking = false;
  }
}

function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(step);
  }
}

function onResize() {
  measure();
  onScroll();
}

measure();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onResize);

// ---------------------------------------------------------------------------
// Custom cursor — a small glowing core with a softly trailing aura. Only
// created at all on fine-pointer (mouse/trackpad) devices, so touch screens
// never pay for the extra DOM node or the rAF loop.
// ---------------------------------------------------------------------------

if (window.matchMedia("(pointer: fine)").matches) {
  const cursor = document.createElement("div");
  cursor.className = "cursor";
  cursor.innerHTML = '<div class="cursor__aura"></div><div class="cursor__core"></div>';
  document.body.appendChild(cursor);
  document.documentElement.classList.add("has-custom-cursor");

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let cursorX = targetX;
  let cursorY = targetY;
  let cursorTicking = false;

  window.addEventListener(
    "pointermove",
    (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!cursorTicking) {
        cursorTicking = true;
        requestAnimationFrame(renderCursor);
      }
    },
    { passive: true }
  );

  function renderCursor() {
    if (prefersReducedMotion) {
      cursorX = targetX;
      cursorY = targetY;
    } else {
      // Slight inertia — the aura settles a beat behind the raw pointer.
      cursorX += (targetX - cursorX) * 0.35;
      cursorY += (targetY - cursorY) * 0.35;
    }
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;

    if (Math.abs(targetX - cursorX) > 0.1 || Math.abs(targetY - cursorY) > 0.1) {
      requestAnimationFrame(renderCursor);
    } else {
      cursorTicking = false;
    }
  }

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("a, button")) cursor.classList.add("is-hovering");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("a, button")) cursor.classList.remove("is-hovering");
  });
  document.addEventListener("mouseleave", () => cursor.style.opacity = "0");
  document.addEventListener("mouseenter", () => cursor.style.opacity = "1");
}
