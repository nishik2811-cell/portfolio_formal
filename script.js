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

// Section-driven state — one IntersectionObserver doing two jobs:
//   1. Highlight the nav link for whichever section is centered in the
//      viewport.
//   2. Set body[data-scene="..."] so CSS (see styles.css) can smoothly
//      adjust the shared video's overlay opacity/brightness per section.
// Both are event-driven, not scroll listeners — nothing runs between
// section crossings, which is the main reason this replaced the old
// scroll-scrubbed version: there is no per-scroll-pixel work left at all.
const desktopNavLinks = document.querySelectorAll(".nav__links a");
const sceneForSection = {
  home: "hero",
  about: "about",
  interlude: "interlude",
  stack: "stack",
  projects: "projects",
  current: "current",
  experience: "experience",
  contact: "contact",
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      document.body.dataset.scene = sceneForSection[id] || "";
      desktopNavLinks.forEach((a) => {
        a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
);
Object.keys(sceneForSection).forEach((id) => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

// ---------------------------------------------------------------------------
// Reveal-on-scroll — one subtle fade/slide-in per element, first time only.
// Also covers the section-label accent lines (.reveal-line draws its width
// instead of fading; see styles.css) via the same observer/class toggle.
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

document.querySelectorAll(".reveal, .reveal-line").forEach((el) => revealObserver.observe(el));

// ---------------------------------------------------------------------------
// Background video — one persistent <video>, autoplay/loop/muted (see
// index.html). It is never paused, seeked, or re-mounted; script.js does not
// touch it at all beyond this one defensive play() in case autoplay was
// blocked. Its visual prominence changes only via CSS (opacity/filter driven
// by body[data-scene] above) — never via playback state.
// ---------------------------------------------------------------------------

const video = document.getElementById("bgVideo");
const playResult = video.play();
if (playResult && playResult.catch) playResult.catch(() => {});

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
  const spark = document.createElement("div");
  spark.className = "cursor-spark";
  document.body.append(core, aura, spark);
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
  let sparkX = targetX;
  let sparkY = targetY;
  let cursorTicking = false;

  function renderCursor() {
    if (prefersReducedMotion) {
      coreX = targetX;
      coreY = targetY;
      auraX = targetX;
      auraY = targetY;
      sparkX = targetX;
      sparkY = targetY;
    } else {
      // Core tracks tightly; the aura settles in a beat behind it; the
      // spark lags furthest — three fixed elements, no per-frame allocation,
      // reading as a small trailing afterimage rather than a rigid dot.
      coreX += (targetX - coreX) * 0.55;
      coreY += (targetY - coreY) * 0.55;
      auraX += (targetX - auraX) * 0.18;
      auraY += (targetY - auraY) * 0.18;
      sparkX += (targetX - sparkX) * 0.09;
      sparkY += (targetY - sparkY) * 0.09;
    }

    core.style.transform = `translate3d(${coreX}px, ${coreY}px, 0) translate(-50%, -50%)`;
    aura.style.transform = `translate3d(${auraX}px, ${auraY}px, 0) translate(-50%, -50%)`;
    spark.style.transform = `translate3d(${sparkX}px, ${sparkY}px, 0) translate(-50%, -50%)`;
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
      Math.abs(targetY - auraY) < 0.1 &&
      Math.abs(targetX - sparkX) < 0.1 &&
      Math.abs(targetY - sparkY) < 0.1;

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
    spark.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    core.style.opacity = "1";
    aura.style.opacity = "1";
    spark.style.opacity = "1";
  });

  // Buttons: a small magnetic pull toward the pointer, plus a local light
  // (--mx/--my, consumed by .btn::before) that follows the cursor within
  // the button's own bounds.
  document.querySelectorAll(".btn").forEach((btn) => {
    let rect = null;
    btn.addEventListener("mousemove", (e) => {
      rect = rect || btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      btn.style.setProperty("--mx", `${x}%`);
      btn.style.setProperty("--my", `${y}%`);

      if (prefersReducedMotion) return;
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      const pull = 0.2;
      const maxPull = 8;
      const x2 = Math.max(-maxPull, Math.min(maxPull, relX * pull));
      const y2 = Math.max(-maxPull, Math.min(maxPull, relY * pull));
      btn.style.transform = `translate(${x2}px, ${y2}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      rect = null;
      btn.style.transform = "";
    });
  });

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
