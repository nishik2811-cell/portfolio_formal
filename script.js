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
// Scroll-controlled video — scroll position drives video.currentTime while
// the video stays pinned via CSS position: sticky on its wrapper.
// ---------------------------------------------------------------------------

const reelSection = document.getElementById("reel");
const video = document.getElementById("reelVideo");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let duration = 0;
let ticking = false;

video.addEventListener("loadedmetadata", () => {
  duration = video.duration || 0;
  onScroll();
});

function computeProgress() {
  const rect = reelSection.getBoundingClientRect();
  const scrollableHeight = reelSection.offsetHeight - window.innerHeight;
  if (scrollableHeight <= 0) return 0;
  // rect.top is 0 when the pinned section starts covering the viewport.
  const raw = -rect.top / scrollableHeight;
  return Math.min(Math.max(raw, 0), 1);
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
  const target = computeProgress() * duration;

  if (prefersReducedMotion) {
    video.currentTime = target;
    ticking = false;
    return;
  }

  const diff = target - video.currentTime;
  video.currentTime += diff * 0.2;

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

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
