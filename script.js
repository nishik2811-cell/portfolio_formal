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
          ${group.items
            .map(
              (item) => `
            <li>
              <span class="stack__item" tabindex="0">
                ${item.name}<span class="stack__note">${item.note}</span>
              </span>
            </li>`
            )
            .join("")}
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
          ${
            p.tech.length
              ? `<ul class="project__tech">${p.tech.map((t) => `<li>${t}</li>`).join("")}</ul>`
              : ""
          }
          <div class="project__links">
            ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener">Code <span>→</span></a>` : ""}
            ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener">Live demo <span>→</span></a>` : ""}
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

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------------------
// Navigation — solid background on scroll, active-section indicator, mobile
// menu toggle.
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

// Highlights the nav link for whichever section currently sits in the
// vertical center of the viewport — event-driven (IntersectionObserver),
// not a scroll listener, so it costs nothing between section crossings.
const desktopNavLinks = document.querySelectorAll(".nav__links a");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      desktopNavLinks.forEach((a) => {
        a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
);
["home", "about", "stack", "projects", "current", "experience", "contact"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

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
// Cinematic hero video — a single fixed, full-viewport <video> behind the
// whole page (see .bg-video in styles.css). Only the HERO's own scroll track
// scrubs it; once the user scrolls past the hero, the video hands off to
// normal looping playback and is never touched by scroll again.
//
//   1. Hero   — scrolling through the hero's tall track (.hero, 240vh) plays
//               the video's first HERO_TIME_FRACTION, eased with easeOutCubic
//               so motion is quickest early and settles near the end — the
//               "cinematic breathing" beat the brief asked for, expressed as
//               a curve rather than a separate freeze step.
//   2. Rest   — past the hero, video.currentTime is never written again; the
//               video just plays (and loops) natively in the background.
//
// Performance: no getBoundingClientRect() in the scroll hot path (hero
// height is measured once on load/resize); video.currentTime is only ever
// written when the change is bigger than a fraction of a frame; scroll
// events coalesce into a single requestAnimationFrame via `ticking`.
// ---------------------------------------------------------------------------

const video = document.getElementById("bgVideo");
const heroEl = document.getElementById("home");
const heroScrollHint = document.getElementById("heroScroll");

const HERO_TIME_FRACTION = 0.25; // the hero uses roughly the first quarter of the video
const MIN_TIME_DELTA = 1 / 60; // skip writes smaller than this — no visible difference

let duration = 0;
let heroHeight = window.innerHeight;
let isScrubbing = true;
let ticking = false;

function measure() {
  heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight;
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

video.addEventListener("loadedmetadata", () => {
  duration = video.duration || 0;
  onScroll();
});

function heroProgress() {
  return Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
}

function setScrubUI(p) {
  // Hide the scroll hint mid-scrub, bring it back near the end as a cue
  // that the site is about to open up.
  heroScrollHint.classList.toggle("is-mid", p > 0.08 && p < 0.85);
}

function scrubStep() {
  if (!duration) {
    ticking = false;
    return;
  }
  const p = heroProgress();
  setScrubUI(p);
  const target = easeOutCubic(p) * HERO_TIME_FRACTION * duration;
  const diff = target - video.currentTime;

  if (prefersReducedMotion) {
    if (Math.abs(diff) > MIN_TIME_DELTA) video.currentTime = target;
    ticking = false;
    return;
  }

  const next = video.currentTime + diff * 0.22;
  if (Math.abs(next - video.currentTime) > MIN_TIME_DELTA) {
    video.currentTime = next;
  }

  if (Math.abs(diff) > 0.02) {
    requestAnimationFrame(scrubStep);
  } else {
    ticking = false;
  }
}

function syncVideoMode() {
  const inHero = window.scrollY < heroHeight;
  if (inHero && !isScrubbing) {
    isScrubbing = true;
    video.pause();
  } else if (!inHero && isScrubbing) {
    isScrubbing = false;
    video.loop = true;
    const playResult = video.play();
    if (playResult && playResult.catch) playResult.catch(() => {});
  }
}

function onScroll() {
  syncVideoMode();
  if (isScrubbing && !ticking) {
    ticking = true;
    requestAnimationFrame(scrubStep);
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
// Atmosphere — a handful of CSS-only twinkling stars. Generated once here,
// then left entirely to CSS keyframes; no per-frame JS cost.
// ---------------------------------------------------------------------------

(function initStars() {
  const container = document.getElementById("stars");
  if (!container) return;
  const count = window.innerWidth < 640 ? 10 : 18;
  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");
    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${(Math.random() * 6).toFixed(2)}s`;
    star.style.animationDuration = `${(5 + Math.random() * 4).toFixed(2)}s`;
    container.appendChild(star);
  }
})();

// ---------------------------------------------------------------------------
// Fine-pointer-only interactive layer: custom cursor, pointer-reactive
// background light, magnetic buttons, and per-card cursor-follow light on
// project cards. Nothing here is created on touch devices — matchMedia
// gates the whole block, so touch pays zero cost for it.
// ---------------------------------------------------------------------------

if (window.matchMedia("(pointer: fine)").matches) {
  const core = document.createElement("div");
  core.className = "cursor-core";
  const aura = document.createElement("div");
  aura.className = "cursor-aura";
  aura.innerHTML = '<span class="cursor-aura__label">View</span>';
  document.body.append(core, aura);
  document.documentElement.classList.add("has-custom-cursor");

  const bgLight = document.getElementById("bgLight");
  const starsLayer = document.getElementById("stars");
  if (bgLight) bgLight.classList.add("is-active");

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let coreX = targetX;
  let coreY = targetY;
  let auraX = targetX;
  let auraY = targetY;
  let cursorTicking = false;

  function renderCursor() {
    if (prefersReducedMotion) {
      coreX = targetX;
      coreY = targetY;
      auraX = targetX;
      auraY = targetY;
    } else {
      // Core tracks tightly; the aura settles in a beat behind it, giving
      // the trailing "energy particle" feel without spawning extra nodes.
      coreX += (targetX - coreX) * 0.55;
      coreY += (targetY - coreY) * 0.55;
      auraX += (targetX - auraX) * 0.18;
      auraY += (targetY - auraY) * 0.18;
    }

    core.style.transform = `translate3d(${coreX}px, ${coreY}px, 0) translate(-50%, -50%)`;
    aura.style.transform = `translate3d(${auraX}px, ${auraY}px, 0) translate(-50%, -50%)`;
    document.documentElement.style.setProperty("--mx", `${targetX}px`);
    document.documentElement.style.setProperty("--my", `${targetY}px`);

    if (starsLayer && !prefersReducedMotion) {
      const dx = (targetX / window.innerWidth - 0.5) * 10;
      const dy = (targetY / window.innerHeight - 0.5) * 10;
      starsLayer.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    const settled =
      Math.abs(targetX - coreX) < 0.1 &&
      Math.abs(targetY - coreY) < 0.1 &&
      Math.abs(targetX - auraX) < 0.1 &&
      Math.abs(targetY - auraY) < 0.1;

    if (!settled) {
      requestAnimationFrame(renderCursor);
    } else {
      cursorTicking = false;
    }
  }
  renderCursor();

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

  // Hover states — checks e.relatedTarget so moving between two elements
  // that share the same closest(".project"/"a, button, ...") ancestor
  // doesn't flicker the state off and back on.
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(".project")) {
      aura.classList.add("is-project", "is-hovering");
      core.classList.add("is-hovering");
    } else if (e.target.closest("a, button, .stack__item, .about__tag")) {
      aura.classList.add("is-hovering");
      core.classList.add("is-hovering");
    }
  });

  document.addEventListener("mouseout", (e) => {
    const project = e.target.closest(".project");
    if (project && (!e.relatedTarget || !project.contains(e.relatedTarget))) {
      aura.classList.remove("is-project", "is-hovering");
      core.classList.remove("is-hovering");
    }
    const interactive = e.target.closest("a, button, .stack__item, .about__tag");
    if (interactive && (!e.relatedTarget || !interactive.contains(e.relatedTarget))) {
      aura.classList.remove("is-hovering");
      core.classList.remove("is-hovering");
    }
  });

  document.addEventListener("mouseleave", () => {
    core.style.opacity = "0";
    aura.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    core.style.opacity = "1";
    aura.style.opacity = "1";
  });

  // Magnetic buttons — a small, damped pull toward the pointer.
  if (!prefersReducedMotion) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        const pull = 0.2;
        const maxPull = 8;
        const x = Math.max(-maxPull, Math.min(maxPull, relX * pull));
        const y = Math.max(-maxPull, Math.min(maxPull, relY * pull));
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  // Per-card mouse-follow light on project cards. Rect is cached on enter
  // rather than re-measured every mousemove.
  document.querySelectorAll(".project").forEach((card) => {
    let rect = null;
    card.addEventListener("pointerenter", () => {
      rect = card.getBoundingClientRect();
    });
    card.addEventListener("pointermove", (e) => {
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });
  });
}
