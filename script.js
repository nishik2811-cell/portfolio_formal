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
    .map(
      (p, i) => `
      <article class="project reveal" style="--stagger-index: ${i}">
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
        ${
          p.github || p.demo
            ? `<div class="project__links">
                ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener">Code <span>→</span></a>` : ""}
                ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener">Live demo <span>→</span></a>` : ""}
              </div>`
            : ""
        }
      </article>`
    )
    .join("");
}

function renderCurrent() {
  const root = document.getElementById("currentList");
  root.innerHTML = PORTFOLIO_DATA.currentlyWorking
    .map(
      (c, i) => `
      <div class="current__item reveal" style="--stagger-index: ${i}">
        <div class="current__item-head">
          <span class="current__number">${c.number}</span>
          <span class="current__status">${c.status}</span>
        </div>
        <h3 class="current__title">${c.title}</h3>
        <span class="current__category">${c.category}</span>
        <p class="current__desc">${c.description}</p>
      </div>`
    )
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
// Adaptive hero text contrast — the hero name/tagline gradually shift
// between an icy-white and a deep-navy rendering as the video plays behind
// them, so the text stays readable whether that moment of the scene is dark
// or bright. This never touches playback (no currentTime, no seeking); it
// only *reads* the current frame to estimate brightness.
//
// Method: draw the video into a tiny (32×18) offscreen canvas — cheap
// regardless of the video's real resolution — then average the luminance
// of just the sub-region roughly behind the hero text (left/upper-middle
// of frame). That raw sample is noisy frame-to-frame, so it's smoothed
// with an exponential moving average before being mapped to a color; the
// CSS `transition` on the affected properties smooths it a second time,
// so the result eases continuously rather than snapping or flickering.
// Sampling is throttled to ~7.5/sec (setInterval, not rAF) and skipped
// entirely whenever the hero isn't the active scene.
// ---------------------------------------------------------------------------

(function initAdaptiveHeroContrast() {
  const canvas = document.createElement("canvas");
  const SAMPLE_W = 32;
  const SAMPLE_H = 18;
  canvas.width = SAMPLE_W;
  canvas.height = SAMPLE_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  // Crop within the tiny canvas approximating where the hero name/tagline
  // actually sit: left ~45% of frame, roughly the vertical band the text
  // occupies (not the sky/hair above or below it).
  const cropX = 0;
  const cropY = Math.round(SAMPLE_H * 0.32);
  const cropW = Math.round(SAMPLE_W * 0.46);
  const cropH = Math.round(SAMPLE_H * 0.38);

  // Endpoints straight from the brief: warm/icy white on a dark scene,
  // deep navy on a bright one. The secondary pair is a touch more muted,
  // keeping the tagline visually subordinate to the name.
  const TEXT_DARK_SCENE = [243, 245, 247];
  const TEXT_BRIGHT_SCENE = [15, 28, 50];
  const SECONDARY_DARK_SCENE = [205, 214, 227];
  const SECONDARY_BRIGHT_SCENE = [32, 43, 64];

  let smoothed = 0.35; // assume a mid-dark scene before the first real sample
  const SMOOTHING = 0.18; // exponential moving average factor per tick

  function lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  // A straight linear map spends real time producing a muddy mid-gray
  // whenever the sampled region is a mix of bright and dark content at
  // once (very common — a video frame rarely reads as one flat tone) —
  // and a mid-gray is often the worst-contrast color against either a
  // light or dark backdrop, which is exactly what must never happen here.
  // This steepens the response so it resolves toward a clearly-light or
  // clearly-dark result as soon as the input leans even slightly off
  // center, while still passing through every intermediate value
  // continuously as the (already-smoothed) luminance changes — no jump,
  // just a steeper curve.
  function steepen(t) {
    const x = t * 2 - 1; // -1..1
    const y = Math.sign(x) * Math.pow(Math.abs(x), 0.45);
    return (y + 1) / 2;
  }

  function sampleAndApply() {
    if (document.body.dataset.scene !== "hero") return;
    if (video.readyState < 2) return;

    try {
      ctx.drawImage(video, 0, 0, SAMPLE_W, SAMPLE_H);
      const { data } = ctx.getImageData(cropX, cropY, cropW, cropH);
      let total = 0;
      const pixelCount = data.length / 4;
      for (let i = 0; i < data.length; i += 4) {
        total += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      }
      const raw = total / pixelCount / 255; // 0 (black) .. 1 (white)
      smoothed += (raw - smoothed) * SMOOTHING;
    } catch (err) {
      // Canvas readback blocked (e.g. some file:// origin quirks) — keep
      // using the last known value rather than erroring the page.
      return;
    }

    const rawT = Math.min(Math.max(smoothed, 0), 1);
    const t = steepen(rawT);
    const primary = `rgb(${lerp(TEXT_DARK_SCENE[0], TEXT_BRIGHT_SCENE[0], t)}, ${lerp(TEXT_DARK_SCENE[1], TEXT_BRIGHT_SCENE[1], t)}, ${lerp(TEXT_DARK_SCENE[2], TEXT_BRIGHT_SCENE[2], t)})`;
    const secondary = `rgb(${lerp(SECONDARY_DARK_SCENE[0], SECONDARY_BRIGHT_SCENE[0], t)}, ${lerp(SECONDARY_DARK_SCENE[1], SECONDARY_BRIGHT_SCENE[1], t)}, ${lerp(SECONDARY_DARK_SCENE[2], SECONDARY_BRIGHT_SCENE[2], t)})`;

    // A video frame is rarely one flat tone — the risky case isn't the
    // scene's average brightness, it's a *local* patch that's the same
    // tone as the text itself (dark hair/linework under dark text on an
    // otherwise bright frame, or a bright highlight under light text on an
    // otherwise dark one). The rim needed there is the *opposite* tone of
    // the text: light text gets a dark rim (guards against bright patches),
    // dark text gets a light rim (guards against dark patches) — so each
    // strengthens as its matching text tone strengthens, not the other way
    // around.
    //
    // `ambiguity` peaks at 1 exactly when the sampled brightness sits at
    // the midpoint — the one case where no text color is guaranteed to
    // contrast well against the whole sampled region. Both rims get a
    // boost there, as extra insurance under a color choice that's
    // necessarily a compromise.
    const ambiguity = 1 - Math.abs(rawT - 0.5) * 2;
    const shadowY = lerp(0, 2, t);
    const darkBlur = lerp(10, 6, t) + ambiguity * 4;
    const darkAlpha = Math.min(1, 0.78 - 0.5 * t + ambiguity * 0.15).toFixed(2);
    const lightBlur = lerp(6, 12, t) + ambiguity * 4;
    const lightAlpha = Math.min(1, 0.22 + 0.55 * t + ambiguity * 0.15).toFixed(2);
    const shadow = `0 ${shadowY}px ${darkBlur}px rgba(5, 7, 13, ${darkAlpha}), 0 0 ${lightBlur}px rgba(255, 255, 255, ${lightAlpha})`;
    const secondaryShadow = `0 ${shadowY}px ${Math.round(darkBlur * 0.75)}px rgba(5, 7, 13, ${(darkAlpha * 0.9).toFixed(2)}), 0 0 ${Math.round(lightBlur * 0.75)}px rgba(255, 255, 255, ${(lightAlpha * 0.85).toFixed(2)})`;

    // A crisp 1px stroke backs up the soft blur above with a hard edge —
    // the blur alone reads as a glow, which isn't enough definition when a
    // letter sits directly over linework close to the text's own tone.
    // Picks whichever rim tone the current text needs, strongest exactly
    // when ambiguity says the blur alone is least trustworthy.
    const strokeAlpha = (0.4 + ambiguity * 0.3).toFixed(2);
    const stroke = t < 0.5 ? `rgba(5, 7, 13, ${strokeAlpha})` : `rgba(255, 255, 255, ${strokeAlpha})`;

    const root = document.documentElement.style;
    root.setProperty("--hero-text-color", primary);
    root.setProperty("--hero-text-color-secondary", secondary);
    root.setProperty("--hero-text-shadow", shadow);
    root.setProperty("--hero-text-shadow-secondary", secondaryShadow);
    root.setProperty("--hero-text-stroke", stroke);
  }

  sampleAndApply();
  setInterval(sampleAndApply, 130); // ~7.5 samples/sec — well under one per frame
})();

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
