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
// Adaptive video-aware text contrast, two different ways:
//
// - Hero name/tagline: a fixed, known rhythm timed to video.currentTime —
//   a moderate dark tone for nearly the whole loop, easing to a light one
//   only in its final couple of seconds (see HERO_TRANSITION_TAIL below).
//   Deliberately not sampled: reading actual pixel brightness every tick
//   reacted to real per-frame noise (motion, grain) and read as the text
//   restlessly glowing/pulsing rather than calmly adapting, whereas a
//   clock-driven transition is inherently steady. Never touches playback
//   itself (no currentTime is ever *set*, only read).
//
// - --text-label (small captions scattered across every section — section
//   numbers, eyebrows, stat captions): still a genuine per-frame read,
//   since there's no single fixed spot a clock-based rule could target.
//   Draws the video into a tiny (32×18) offscreen canvas — cheap
//   regardless of the video's real resolution — and averages its
//   luminance. That raw sample is noisy frame-to-frame, so it's smoothed
//   with an exponential moving average before being mapped to a color;
//   the CSS `transition` on every consumer smooths it a second time.
//
// Both are throttled to ~7.5/sec (setInterval, not rAF).
// ---------------------------------------------------------------------------

(function initAdaptiveHeroContrast() {
  // The hero name/tagline hold a moderate dark tone for nearly the whole
  // video loop, then ease to a light one only in its final couple of
  // seconds — a deliberate, predictable rhythm timed to video.currentTime
  // rather than a continuous per-frame brightness read. The earlier
  // version sampled the video's actual pixels every tick, which reacted
  // to real but small frame-to-frame brightness noise (motion, grain) and
  // read as the text restlessly glowing/pulsing rather than calmly
  // adapting; a fixed, known transition window is inherently steady
  // since nothing but the clock drives it.
  const HERO_TRANSITION_TAIL = 2.5; // seconds before loop-end the ease-to-light starts

  // The dark state stays moderate rather than near-black ("don't go very
  // dark") so it still reads as a legible, sitting-comfortably-dark tone
  // rather than vanishing into the darkest parts of the frame.
  const TEXT_DARK_SCENE = [243, 245, 247]; // the light state (last ~2.5s of the loop)
  const TEXT_BRIGHT_SCENE = [86, 100, 128]; // the dark state (everywhere else) — moderate, not near-black
  const SECONDARY_DARK_SCENE = [205, 214, 227];
  const SECONDARY_BRIGHT_SCENE = [100, 112, 136];
  // A second, independent pair for the name's gradient fill (see
  // .hero__name-word) — a bit richer/darker than the primary pair at
  // both ends, so the two gradient stops stay visibly distinct across
  // the *whole* loop. Nudging off the primary color by a fixed offset
  // instead would collapse to an invisible one-color gradient whenever
  // primary sits at (or clamps to) either end of its own range, which is
  // most of the loop — the flat dark phase lasts far longer than the
  // brief transition.
  const TEXT_DARK_SCENE_DEEP = [214, 220, 236];
  const TEXT_BRIGHT_SCENE_DEEP = [52, 64, 92];
  // --text-label's static color (#7f9bc0) is a mid-tone blue that can
  // wash out against a bright patch of video with nothing but a text-
  // shadow to help it — these endpoints swap it for something with real
  // contrast at either extreme, while staying in the same blue family.
  // Deliberately closer together than the hero pair above: this drives
  // small captions scattered across every section, not one large focal
  // heading, so a wide, saturated swing read as the label "glowing" and
  // pulsing rather than quietly adapting.
  const LABEL_DARK_SCENE = [148, 168, 202]; // a shade lighter than the old static color
  const LABEL_BRIGHT_SCENE = [55, 68, 94]; // dark, muted navy-blue

  let smoothedGeneral = 0.35; // assume a mid-dark scene before the first real sample
  // The label reads from the *whole* frame, so frame-to-frame noise
  // (motion, particles, compression) averages out less on its own than
  // it used to for the hero's old narrow crop — a slow factor here is
  // what actually keeps it calm.
  const SMOOTHING_GENERAL = 0.035;

  // A tiny offscreen canvas is still used, just for --text-label's
  // full-frame brightness read below — the hero name/tagline no longer
  // touch the canvas at all (see HERO_TRANSITION_TAIL above).
  const canvas = document.createElement("canvas");
  const SAMPLE_W = 32;
  const SAMPLE_H = 18;
  canvas.width = SAMPLE_W;
  canvas.height = SAMPLE_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  function lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  // Smoothstep: eases in and out of the transition window rather than
  // moving at a constant rate the instant it starts, so the shift into
  // (and the hold at) the light state feels settled rather than linear.
  function smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  function sampleAndApply() {
    if (video.readyState < 2) return;

    // Deterministic, time-based rather than sampled: dark for the whole
    // loop except its last HERO_TRANSITION_TAIL seconds, which ease to
    // light. Falls back to "stay dark" if duration isn't known yet or is
    // too short to fit a real transition.
    const duration = video.duration;
    let heroT = 0;
    if (duration && duration > HERO_TRANSITION_TAIL) {
      const transitionStart = duration - HERO_TRANSITION_TAIL;
      heroT =
        video.currentTime <= transitionStart
          ? 0
          : smoothstep(
              Math.min(1, (video.currentTime - transitionStart) / HERO_TRANSITION_TAIL)
            );
    }
    // Downstream math (further below) was written the other way round —
    // t=0 reads as "text is light, needs a dark rim", t=1 as "text is
    // dark, needs a light rim" — so heroT (0 = dark text) feeds in
    // inverted, and the light/dark endpoint lerps below follow suit.
    const t = 1 - heroT;

    const primary = `rgb(${lerp(TEXT_DARK_SCENE[0], TEXT_BRIGHT_SCENE[0], t)}, ${lerp(TEXT_DARK_SCENE[1], TEXT_BRIGHT_SCENE[1], t)}, ${lerp(TEXT_DARK_SCENE[2], TEXT_BRIGHT_SCENE[2], t)})`;
    const secondary = `rgb(${lerp(SECONDARY_DARK_SCENE[0], SECONDARY_BRIGHT_SCENE[0], t)}, ${lerp(SECONDARY_DARK_SCENE[1], SECONDARY_BRIGHT_SCENE[1], t)}, ${lerp(SECONDARY_DARK_SCENE[2], SECONDARY_BRIGHT_SCENE[2], t)})`;
    // The second stop for the name's gradient fill (see .hero__name-word)
    // — driven by the same t as primary, so it moves in lockstep through
    // the dark/light transition, just always a bit richer/deeper.
    const primaryDeep = `rgb(${lerp(TEXT_DARK_SCENE_DEEP[0], TEXT_BRIGHT_SCENE_DEEP[0], t)}, ${lerp(TEXT_DARK_SCENE_DEEP[1], TEXT_BRIGHT_SCENE_DEEP[1], t)}, ${lerp(TEXT_DARK_SCENE_DEEP[2], TEXT_BRIGHT_SCENE_DEEP[2], t)})`;

    // A single plain dark contact shadow — no light-colored halo. An
    // earlier version paired this with a soft white glow (to help *dark*
    // text stay legible against a dark patch of video), but that read as
    // the text glowing, which was worse than the contrast problem it was
    // solving. Simpler and calmer: one dark shadow, a bit stronger once
    // the text itself is dark (against a brighter scene) since that's
    // when a shadow does the most legibility work.
    //
    // This shadow is now the *only* thing carrying contrast against
    // whatever the video actually looks like at a given moment — the text
    // color itself just follows the clock (see HERO_TRANSITION_TAIL
    // above), not the real frame, so unlike before there's no per-frame
    // brightness read backing it up. Sized generously (dense, wide blur)
    // as a static safety margin for that, rather than reacting live.
    // Two dark layers, not one: a tight, near-solid one right at the
    // glyph edge (does the real work against something as bright and
    // uniform as, say, a full moon filling the frame) plus a wider, softer
    // one for an ambient contact shadow. Still entirely dark/no halo —
    // just dense enough now to hold up against the brightest realistic
    // patch of video, not only an average one.
    const shadowY = lerp(0, 2, t);
    const tightBlur = 3;
    const tightAlpha = Math.min(1, 0.8 + t * 0.2).toFixed(2);
    const wideBlur = lerp(30, 20, t);
    const wideAlpha = Math.min(1, 0.6 + t * 0.3).toFixed(2);
    const shadow = `0 0 ${tightBlur}px rgba(5, 7, 13, ${tightAlpha}), 0 ${shadowY}px ${wideBlur}px rgba(5, 7, 13, ${wideAlpha})`;
    const secondaryShadow = `0 0 ${Math.round(tightBlur * 0.85)}px rgba(5, 7, 13, ${(tightAlpha * 0.9).toFixed(2)}), 0 ${shadowY}px ${Math.round(wideBlur * 0.85)}px rgba(5, 7, 13, ${(wideAlpha * 0.9).toFixed(2)})`;

    // Stroke stays dark-only too, for the same reason — a fixed, subtle
    // edge, never a light one that could read as glowing.
    const stroke = "rgba(5, 7, 13, 0.55)";

    const root = document.documentElement.style;
    root.setProperty("--hero-text-color", primary);
    root.setProperty("--hero-text-color-deep", primaryDeep);
    root.setProperty("--hero-text-color-secondary", secondary);
    root.setProperty("--hero-text-shadow", shadow);
    root.setProperty("--hero-text-shadow-secondary", secondaryShadow);
    root.setProperty("--hero-text-stroke", stroke);

    // --text-label is still driven by the video's actual brightness
    // (unlike the hero vars above, its consumers are scattered all over
    // whichever section is on screen, not one fixed spot a clock-based
    // rule could target) — wrapped separately so a canvas failure here
    // (e.g. a file:// origin) only leaves this one stale, rather than
    // also skipping the hero update above.
    try {
      ctx.drawImage(video, 0, 0, SAMPLE_W, SAMPLE_H);
      const { data: fullData } = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
      let fullTotal = 0;
      const fullPixelCount = fullData.length / 4;
      for (let i = 0; i < fullData.length; i += 4) {
        fullTotal += fullData[i] * 0.299 + fullData[i + 1] * 0.587 + fullData[i + 2] * 0.114;
      }
      const rawFull = fullTotal / fullPixelCount / 255;
      smoothedGeneral += (rawFull - smoothedGeneral) * SMOOTHING_GENERAL;

      // Overrides the --text-label token itself (declared on :root in
      // styles.css) rather than a separate variable, so every existing
      // `color: var(--text-label)` consumer picks this up automatically —
      // no per-selector changes needed to opt in. No steepen() here,
      // deliberately: that curve exaggerates small input changes into
      // much bigger output swings near either end, which is exactly what
      // made this feel like it was "glowing"/pulsing rather than calmly
      // adapting — a plain linear map moves only as much as the (already
      // heavily-smoothed) brightness actually did.
      const tGeneral = Math.min(Math.max(smoothedGeneral, 0), 1);
      const label = `rgb(${lerp(LABEL_DARK_SCENE[0], LABEL_BRIGHT_SCENE[0], tGeneral)}, ${lerp(LABEL_DARK_SCENE[1], LABEL_BRIGHT_SCENE[1], tGeneral)}, ${lerp(LABEL_DARK_SCENE[2], LABEL_BRIGHT_SCENE[2], tGeneral)})`;
      root.setProperty("--text-label", label);
    } catch (err) {
      // Canvas readback blocked (e.g. some file:// origin quirks) — keep
      // using the last known --text-label rather than erroring the page.
    }
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
