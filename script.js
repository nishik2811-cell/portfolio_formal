// ---------------------------------------------------------------------------
// Content rendering — reads PORTFOLIO_DATA (data.js) into the DOM.
// ---------------------------------------------------------------------------

function renderEducation() {
  const root = document.getElementById("educationList");
  root.innerHTML = PORTFOLIO_DATA.education
    .map(
      (e, i) => `
      <div class="education__item reveal" style="--stagger-index: ${i}">
        <span class="education__period">${e.period}</span>
        <div class="education__body">
          <h3 class="education__institution">${e.institution}</h3>
          <p class="education__degree">${e.degree}</p>
          <span class="education__score">${e.score}</span>
        </div>
      </div>`
    )
    .join("");
}

function renderStack() {
  const root = document.getElementById("stackList");
  root.innerHTML = PORTFOLIO_DATA.techStack
    .map(
      (group, i) => `
      <div class="stack__group reveal" style="--stagger-index: ${i}">
        <span class="stack__index" aria-hidden="true">0${i + 1}</span>
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
    .map((p, i) => {
      // The whole card is the link when there's somewhere to send it (no
      // separate "Code" line to click) — an <a> when p.github/p.demo is
      // set, a plain <article> otherwise.
      const href = p.github || p.demo;
      const tag = href ? "a" : "article";
      const linkAttrs = href ? ` href="${href}" target="_blank" rel="noopener"` : "";
      return `
      <${tag} class="project reveal" style="--stagger-index: ${i}"${linkAttrs}>
        ${p.image ? `<img class="project__image" src="${p.image}" alt="${p.name} screenshot" loading="lazy" />` : ""}
        <div class="project__head">
          <span class="project__index" aria-hidden="true">Project 0${i + 1}</span>
        </div>
        <h3 class="project__name">${p.name}</h3>
        <p class="project__desc">${p.description}</p>
        ${
          p.tech.length
            ? `<ul class="project__tech">${p.tech.map((t) => `<li>${t}</li>`).join("")}</ul>`
            : ""
        }
      </${tag}>`;
    })
    .join("");
}

function renderCurrent() {
  const root = document.getElementById("currentList");
  root.innerHTML = PORTFOLIO_DATA.currentlyWorking
    .map((c, i) => {
      const tag = c.github ? "a" : "div";
      const linkAttrs = c.github ? ` href="${c.github}" target="_blank" rel="noopener"` : "";
      return `
      <${tag} class="current__item reveal" style="--stagger-index: ${i}"${linkAttrs}>
        ${c.image ? `<img class="current__image" src="${c.image}" alt="${c.title} screenshot" loading="lazy" />` : ""}
        <div class="current__item-head">
          <span class="current__number">${c.number}</span>
          <span class="current__status">${c.status}</span>
        </div>
        <h3 class="current__title">${c.title}</h3>
        <span class="current__category">${c.category}</span>
        <p class="current__desc">${c.description}</p>
        ${
          c.tech && c.tech.length
            ? `<ul class="project__tech">${c.tech.map((t) => `<li>${t}</li>`).join("")}</ul>`
            : ""
        }
      </${tag}>`;
    })
    .join("");
}

function renderExperience() {
  const root = document.getElementById("experienceList");
  root.innerHTML = PORTFOLIO_DATA.experience
    .map(
      (e, i) => `
      <div class="experience__item reveal" style="--stagger-index: ${i}">
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

  const emailBtn = document.getElementById("contactEmailBtn");
  if (emailBtn) emailBtn.href = `mailto:${email}`;
}

renderEducation();
renderStack();
renderProjects();
renderCurrent();
renderExperience();
renderContact();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------------------
// Cinematic section depth — scale/translate/opacity driven by scroll
// position, for browsers that don't yet support the native CSS
// `animation-timeline: view()` (see .section / .interlude in styles.css,
// which handles this with zero JS wherever it's supported). Only runs at
// all when that native path is unavailable, and never when reduced motion
// is requested. No blur: it read as a rendering glitch rather than depth,
// so scale/position/opacity carry the whole effect (matches the CSS path).
// ---------------------------------------------------------------------------

(function initSectionDepthFallback() {
  if (window.CSS && CSS.supports && CSS.supports("animation-timeline", "view()")) return;
  if (prefersReducedMotion) return;

  const targets = document.querySelectorAll(".section, .interlude");
  if (!targets.length) return;

  let ticking = false;

  function update() {
    ticking = false;
    const vh = window.innerHeight;

    targets.forEach((el) => {
      const strong = el.classList.contains("interlude");
      const isContact = el.classList.contains("contact");
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      // Triangular falloff: 1 when the section's center sits at the
      // viewport's center, fading to 0 as that center reaches either edge.
      // Contact is the last stop on the page, so once it's reached it
      // should just stay put rather than receding again — never taper
      // past its own center.
      const half = vh / 2 + rect.height / 2;
      const pastCenter = mid <= vh / 2;
      const progress =
        isContact && pastCenter ? 1 : Math.max(0, 1 - Math.abs(mid - vh / 2) / half);
      const sign = mid > vh / 2 ? 1 : -1; // not yet centered vs. past center

      const minScale = strong ? 0.65 : 0.76;
      const minOpacity = strong ? 0.15 : 0.28;
      const maxShift = strong ? 8 : 6;

      const scale = minScale + progress * (1 - minScale);
      const opacity = minOpacity + progress * (1 - minOpacity);
      const shift = (1 - progress) * maxShift * sign;

      el.style.transform = `scale(${scale.toFixed(3)}) translateY(${shift.toFixed(2)}vh)`;
      el.style.opacity = opacity.toFixed(3);
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();

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
  education: "education",
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

document
  .querySelectorAll(".reveal, .reveal-line, .word-reveal")
  .forEach((el) => revealObserver.observe(el));

// ---------------------------------------------------------------------------
// Atmosphere — a handful of CSS-only twinkling stars, plus a few larger
// slow-drifting "motes" of light. Generated once here, then left entirely to
// CSS keyframes/transitions; no per-frame JS cost.
// ---------------------------------------------------------------------------

(function initStars() {
  const container = document.getElementById("stars");
  if (!container) return;
  const count = window.innerWidth < 640 ? 26 : 55;
  for (let i = 0; i < count; i++) {
    const isMote = i % 6 === 0;
    const star = document.createElement("span");
    star.className = isMote ? "star star--mote" : "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${(Math.random() * 6).toFixed(2)}s`;
    star.style.animationDuration = `${(isMote ? 10 + Math.random() * 6 : 5 + Math.random() * 4).toFixed(2)}s`;
    if (!isMote) {
      const size = (1.5 + Math.random() * 1.8).toFixed(1);
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
    }
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

  // Hover state is fully recomputed from whatever's under the cursor right
  // now, rather than toggled on/off across separate mouseover/mouseout
  // listeners — that avoids needing e.relatedTarget containment checks,
  // and (via the scroll listener below) also covers the case a mouseover
  // event can't: scrolling the page under a stationary cursor, which
  // changes what's underneath without firing any mouse event at all and
  // previously left the "View" bubble stuck on from whatever was last
  // actually hovered.
  function syncHoverState(target) {
    const isProject = !!(target && target.closest(".project"));
    const isInteractive =
      isProject || !!(target && target.closest("a, button, .stack__item, .about__tag"));
    aura.classList.toggle("is-project", isProject);
    aura.classList.toggle("is-hovering", isInteractive);
    core.classList.toggle("is-hovering", isInteractive);
  }

  document.addEventListener("mouseover", (e) => syncHoverState(e.target));
  window.addEventListener(
    "scroll",
    () => syncHoverState(document.elementFromPoint(targetX, targetY)),
    { passive: true }
  );

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
      const maxPull = 5;
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
