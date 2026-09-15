// ---------------------------------------------------------------------------
// The portfolio's cat mascot — a canvas character that lives on the six
// .platform ledges inside the one persistent, viewport-fixed #world layer
// (see index.html / styles.css). The world stays framing the screen edges
// while the portfolio's sections scroll and zoom through the middle; the
// cat wanders and jumps between its ledges entirely on its own, decoupled
// from scroll position.
//
// Behavioral foundation is adapted from desksprite
// (github.com/welltilln/desksprite, MIT): a small state machine (idle/sit
// → walk → jump → land, looping on a randomized timer), reduced-motion and
// resize handling, and the general shape of "one instance owns its own
// closured state and a single draw() call repaints it" all follow its
// engine design. What's NOT reused is its renderer: desksprite draws a
// hand-authored palette+ASCII pixel grid, which is a great fit for its own
// small 56px desk pet, but doesn't hold up at this portfolio's much larger,
// rotating/squashing size (a blown-up hand-pixelled grid turns chunky and
// loses the "clean, cute" silhouette the design calls for). So the cat here
// is drawn instead as simple canvas vector shapes (arcs/paths) — the same
// "clean 2D, slightly pixel-inspired" brief, just scalable and smooth
// through a jump arc instead of frame-swapped.
//
// No continuous loop at rest: everything is a one-off draw triggered by a
// state change (blink, look, walk step, jump tick, scene change), scheduled
// with setTimeout/rAF only while something is actually moving.
// ---------------------------------------------------------------------------

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canLook = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isCompact = window.matchMedia("(max-width: 640px)").matches;

  // Design-space canvas the cat is drawn into every frame; CSS then scales
  // this down to the actual on-page size (see .cat in styles.css), so the
  // art stays crisp at any responsive size instead of needing per-breakpoint
  // frames.
  const W = 220;
  const H = 180;

  // Warm, light palette — chosen to read clearly against the midnight-blue
  // world rather than blending into it.
  const FUR = "#f4ecda"; // warm ivory
  const FUR_SHADE = "#d9d3e0"; // pale cool-gray, belly/haunch shading
  const ACCENT = "#c3b7dc"; // lavender-gray, ears/tail tip/paw pads
  const EYE = "#8fd8ff"; // icy blue
  const NOSE = "#c9a0c2"; // muted lavender-rose
  const COLLAR = "#b8a6f2"; // lavender

  // Front-facing, symmetric sitting cat — matches the reference posture:
  // upright triangular ears, round centered eyes, whiskers both sides,
  // front paws together, tail curling around from one side to the front.
  // Used for idle/sit/sleep, where there's no direction of travel to face.
  function drawFront(ctx, s) {
    const cx = 110;

    // tail — curls from the body's right side around to the front paws
    ctx.save();
    ctx.translate(148, 132);
    ctx.rotate(((s.tailAngle * 0.4) * Math.PI) / 180);
    ctx.lineCap = "round";
    ctx.strokeStyle = FUR;
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(30, 24, 6, 46 - s.tailCurl * 0.3);
    ctx.quadraticCurveTo(-16, 60, -34, 44);
    ctx.stroke();
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-14, 59);
    ctx.quadraticCurveTo(-30, 51, -34, 44);
    ctx.stroke();
    ctx.restore();

    // body — haunches + chest/shoulders as two stacked ellipses
    ctx.fillStyle = FUR;
    ctx.beginPath();
    ctx.ellipse(cx, 128, 50, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, 94, 36, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = FUR_SHADE;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(cx, 150, 38, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // front paws, together — or, while grooming, one lifted toward the face
    const pawPos = (ox) => {
      if (s.grooming && ox === 15) return { x: cx + 6, y: 120, rot: -0.5 };
      return { x: cx + ox, y: 166, rot: 0 };
    };
    ctx.fillStyle = FUR;
    [-15, 15].forEach((ox) => {
      const p = pawPos(ox);
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 13, 15, p.rot, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = ACCENT;
    ctx.globalAlpha = 0.5;
    [-15, 15].forEach((ox) => {
      const p = pawPos(ox);
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + (p.rot ? 6 : 8), 8, 5, p.rot, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // collar
    ctx.strokeStyle = COLLAR;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(cx, 90, 26, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = COLLAR;
    ctx.beginPath();
    ctx.arc(cx, 114, 5, 0, Math.PI * 2);
    ctx.fill();

    // head, centered
    const headY = 56 + s.headBob;
    ctx.fillStyle = FUR;
    ctx.beginPath();
    ctx.ellipse(cx, headY, 40, 36, 0, 0, Math.PI * 2);
    ctx.fill();

    // ears — symmetric, upright
    const earShift = s.earFlat ? 4 : 0;
    ctx.fillStyle = FUR;
    ctx.beginPath();
    ctx.moveTo(cx - 34, headY - 16 + earShift);
    ctx.lineTo(cx - 24, headY - 58 + earShift * 0.5);
    ctx.lineTo(cx - 2, headY - 20 + earShift);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 34, headY - 16 + earShift);
    ctx.lineTo(cx + 24, headY - 58 + earShift * 0.5);
    ctx.lineTo(cx + 2, headY - 20 + earShift);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.moveTo(cx - 27, headY - 22 + earShift);
    ctx.lineTo(cx - 21, headY - 46 + earShift * 0.5);
    ctx.lineTo(cx - 9, headY - 24 + earShift);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 27, headY - 22 + earShift);
    ctx.lineTo(cx + 21, headY - 46 + earShift * 0.5);
    ctx.lineTo(cx + 9, headY - 24 + earShift);
    ctx.closePath();
    ctx.fill();

    // cheek shading
    ctx.fillStyle = FUR_SHADE;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(cx, headY + 16, 30, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // eyes — symmetric, centered
    const eyeY = headY - 2;
    [-15, 15].forEach((ox) => {
      const ex = cx + ox + s.lookX;
      const ey = eyeY + s.lookY;
      if (s.blink) {
        ctx.strokeStyle = "#5c5470";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(ex - 6, ey);
        ctx.lineTo(ex + 6, ey);
        ctx.stroke();
      } else {
        ctx.fillStyle = EYE;
        ctx.beginPath();
        ctx.ellipse(ex, ey, 7, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#eaf8ff";
        ctx.beginPath();
        ctx.arc(ex + 2, ey - 2.5, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // nose + simple cat-mouth curve
    ctx.fillStyle = NOSE;
    ctx.beginPath();
    ctx.moveTo(cx, headY + 10);
    ctx.lineTo(cx - 4, headY + 15);
    ctx.lineTo(cx + 4, headY + 15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(92, 84, 112, 0.6)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx, headY + 15);
    ctx.quadraticCurveTo(cx - 6, headY + 21, cx - 11, headY + 17);
    ctx.moveTo(cx, headY + 15);
    ctx.quadraticCurveTo(cx + 6, headY + 21, cx + 11, headY + 17);
    ctx.stroke();

    // whiskers, both sides
    ctx.strokeStyle = "rgba(244, 236, 218, 0.8)";
    ctx.lineWidth = 1.2;
    [-1, 1].forEach((side) => {
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + side * 20, headY + 12 + i * 5);
        ctx.lineTo(cx + side * 42, headY + 8 + i * 8);
        ctx.stroke();
      }
    });

    if (s.sleeping) {
      const bob = Math.sin(performance.now() / 480) * 3;
      ctx.fillStyle = "rgba(210, 220, 255, 0.8)";
      ctx.font = "700 16px 'Space Grotesk', sans-serif";
      ctx.fillText("z", cx + 34, headY - 34 + bob);
      ctx.font = "700 11px 'Space Grotesk', sans-serif";
      ctx.fillText("z", cx + 46, headY - 22 + bob * 0.7);
    }
  }

  // Side-profile cat — used for walk/crouch/jump, where a direction of
  // travel (s.dir, flipped via the outer ctx.scale in draw()) matters.
  function drawSide(ctx, s) {
    // ---- tail: a thick curved stroke behind the body ----
    ctx.save();
    ctx.translate(52, 128);
    ctx.rotate((s.tailAngle * Math.PI) / 180);
    ctx.lineCap = "round";
    ctx.strokeStyle = FUR;
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-38, -18 - s.tailCurl, -30, -58 - s.tailCurl);
    ctx.stroke();
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-30, -58 - s.tailCurl);
    ctx.quadraticCurveTo(-34, -70 - s.tailCurl, -22, -76 - s.tailCurl);
    ctx.stroke();
    ctx.restore();

    // ---- back legs — two, swinging opposite the front paws on a walk, so
    // the gait reads as a real alternating stride rather than just the
    // front paws moving ----
    ctx.fillStyle = FUR;
    [
      { x: 70 + s.legBackX, y: 150 + s.legBackY },
      { x: 87 - s.legBackX, y: 150 + s.legBackY },
    ].forEach((p) => {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 13, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // ---- body ----
    ctx.fillStyle = FUR;
    ctx.beginPath();
    ctx.ellipse(108, 120 + s.bodyDipY, 54, 40, -0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = FUR_SHADE;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.ellipse(108, 145 + s.bodyDipY, 44, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // ---- front legs / paws ----
    ctx.fillStyle = FUR;
    [
      { x: 118 + s.legFrontA, y: 152 + s.legFrontDip },
      { x: 142 + s.legFrontB, y: 156 + s.legFrontDip },
    ].forEach((p) => {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 12, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ACCENT;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 8, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = FUR;
    });

    // ---- collar ----
    ctx.strokeStyle = COLLAR;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(148, 112, 26, 0.35 * Math.PI, 0.95 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = COLLAR;
    ctx.beginPath();
    ctx.arc(150, 134, 5, 0, Math.PI * 2);
    ctx.fill();

    // ---- head (slightly oversized, per the brief) ----
    const headX = 168,
      headY = 86 + s.headBob;
    ctx.fillStyle = FUR;
    ctx.beginPath();
    ctx.ellipse(headX, headY, 42, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // ears
    ctx.fillStyle = FUR;
    const earShift = s.earFlat ? 4 : 0;
    ctx.beginPath();
    ctx.moveTo(headX - 30, headY - 22 + earShift);
    ctx.lineTo(headX - 20, headY - 62 + earShift * 0.5);
    ctx.lineTo(headX - 3, headY - 26 + earShift);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + 8, headY - 27 + earShift);
    ctx.lineTo(headX + 27, headY - 64 + earShift * 0.5);
    ctx.lineTo(headX + 34, headY - 20 + earShift);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.moveTo(headX - 24, headY - 27 + earShift);
    ctx.lineTo(headX - 18, headY - 50 + earShift * 0.5);
    ctx.lineTo(headX - 8, headY - 29 + earShift);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(headX + 14, headY - 30 + earShift);
    ctx.lineTo(headX + 25, headY - 52 + earShift * 0.5);
    ctx.lineTo(headX + 29, headY - 24 + earShift);
    ctx.closePath();
    ctx.fill();

    // cheek shading
    ctx.fillStyle = FUR_SHADE;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(headX - 4, headY + 18, 26, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // eyes
    const eyeY = headY - 2;
    const eyes = [
      { x: headX - 14, y: eyeY },
      { x: headX + 13, y: eyeY },
    ];
    eyes.forEach((e) => {
      const ex = e.x + s.lookX;
      const ey = e.y + s.lookY;
      if (s.blink) {
        ctx.strokeStyle = "#5c5470";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(ex - 6, ey);
        ctx.lineTo(ex + 6, ey);
        ctx.stroke();
      } else {
        ctx.fillStyle = EYE;
        ctx.beginPath();
        ctx.ellipse(ex, ey, 6.5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#eaf8ff";
        ctx.beginPath();
        ctx.arc(ex + 2, ey - 2.5, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // nose + whiskers
    ctx.fillStyle = NOSE;
    ctx.beginPath();
    ctx.moveTo(headX, headY + 12);
    ctx.lineTo(headX - 4, headY + 17);
    ctx.lineTo(headX + 4, headY + 17);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(244, 236, 218, 0.8)";
    ctx.lineWidth = 1.2;
    [-1, 1].forEach((side) => {
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(headX + side * 14, headY + 14 + i * 5);
        ctx.lineTo(headX + side * 34, headY + 10 + i * 8);
        ctx.stroke();
      }
    });

    // sleeping — a couple of small drifting "z"s above the head
    if (s.sleeping) {
      const bob = Math.sin(performance.now() / 480) * 3;
      ctx.fillStyle = "rgba(210, 220, 255, 0.8)";
      ctx.font = "700 16px 'Space Grotesk', sans-serif";
      ctx.fillText("z", headX + 18, headY - 38 + bob);
      ctx.font = "700 11px 'Space Grotesk', sans-serif";
      ctx.fillText("z", headX + 30, headY - 26 + bob * 0.7);
    }
  }

  // Shared outer transform (direction flip, squash/stretch, tilt, lift)
  // around whichever posture is being drawn this frame. Mirroring a
  // symmetric front-facing drawing via s.dir is a no-op visually, so this
  // wrapper doesn't need its own front/side branch.
  function draw(ctx, s) {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2, H / 2 + s.lift);
    ctx.rotate((s.tilt * Math.PI) / 180);
    ctx.scale(s.dir * s.squashX, s.squashY);
    ctx.translate(-W / 2, -H / 2 - s.lift);
    if (s.front) drawFront(ctx, s);
    else drawSide(ctx, s);
    ctx.restore();
  }

  function init() {
    const worldEl = document.getElementById("world");
    if (!worldEl) return;

    const canvas = document.createElement("canvas");
    canvas.className = "cat";
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let platformEl = null;
    let dir = 1;
    let blink = false;
    let lookX = 0;
    let lookY = 0;
    let running = false; // a longer walk gets a quicker leg cycle — the RUN posture
    let pose = "idle"; // idle | sit | sleep | walk | crouch | jump
    let localTimer = null;
    let blinkTimerId = null;
    let glanceTimerId = null;
    let walkStepTimer = null;
    let pokeTimes = [];
    let annoyed = false;
    let cursorCooldownUntil = 0;
    let lastCursorCheck = 0;
    let cursorNoticed = false;

    const CROUCH_MS = 220;
    const WALK_NOTICE_RANGE = 240; // cursor this close to the cat → may walk toward it
    const JUMP_NOTICE_RANGE = 420; // cursor this close to another platform → may jump to it

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function busy() {
      return pose === "walk" || pose === "crouch" || pose === "jump" || pose === "stretch" || pose === "groom";
    }

    function visiblePlatforms() {
      return Array.from(worldEl.querySelectorAll(".platform")).filter((p) => p.offsetParent !== null);
    }

    // Posture parameters that should ease toward their target rather than
    // snap the instant `pose` changes — everything a transition might
    // touch (tail, ears-via-earFlat is boolean so excluded, legs, body
    // dip/lift, squash/stretch, look direction). Booleans/enums (dir,
    // front, blink, sleeping, grooming, earFlat) pass straight through
    // instead: there's nothing to "ease" about a flip.
    const SMOOTH_KEYS = [
      "lookX", "lookY", "squashX", "squashY", "tilt", "lift", "headBob",
      "tailAngle", "tailCurl", "legBackY", "legBackX", "legFrontA",
      "legFrontB", "legFrontDip", "bodyDipY",
    ];
    const current = {};
    SMOOTH_KEYS.forEach((k) => (current[k] = 0));
    let lastRenderTime = performance.now();

    // Pure: today's desired posture, given the current pose/time. render()
    // (below) is the only thing that reads this — it's what gets eased
    // toward, never drawn directly, so a pose switch never shows as a snap.
    function computeTarget(t) {
      const legWalk = pose === "walk";
      const legSpeed = running ? 15 : 9;
      return {
        dir,
        lookX,
        lookY,
        front: pose === "idle" || pose === "sit" || pose === "sleep" || pose === "groom",
        blink: blink || pose === "sleep",
        sleeping: pose === "sleep",
        grooming: pose === "groom",
        squashX: pose === "crouch" ? 1.1 : 1,
        squashY: pose === "crouch" ? 0.84 : 1,
        tilt: 0,
        // A small vertical bob synced to the walk cycle (paws "contacting"
        // the ground twice per stride) on top of the sleep-only lift.
        lift: pose === "sleep" ? 6 : legWalk ? Math.abs(Math.sin(t * legSpeed)) * 4.5 : 0,
        earFlat: annoyed || pose === "crouch",
        headBob:
          pose === "idle" || pose === "sit"
            ? Math.sin(t * 1.6) * 1.4
            : pose === "sleep"
            ? Math.sin(t * 0.8) * 1
            : 0,
        tailAngle:
          pose === "walk"
            ? Math.sin(t * legSpeed) * (running ? 14 : 10)
            : pose === "jump"
            ? -18
            : pose === "crouch"
            ? -6
            : pose === "sit"
            ? 8
            : pose === "sleep"
            ? 20
            : pose === "stretch"
            ? -55
            : 0,
        tailCurl: pose === "sit" || pose === "sleep" ? 14 : 0,
        legBackY: pose === "jump" ? -18 : pose === "crouch" ? 6 : pose === "stretch" ? -20 : 0,
        // Both back legs swing opposite the near front paw during a walk —
        // a real alternating (diagonal-pair) gait rather than just the
        // front paws moving.
        legBackX: legWalk ? -Math.sin(t * legSpeed) * 10 : 0,
        legFrontA: legWalk
          ? Math.sin(t * legSpeed) * 15
          : pose === "jump"
          ? -10
          : pose === "crouch"
          ? 4
          : pose === "stretch"
          ? 30
          : 0,
        legFrontB: legWalk
          ? -Math.sin(t * legSpeed) * 15
          : pose === "jump"
          ? -14
          : pose === "crouch"
          ? 4
          : pose === "stretch"
          ? 34
          : 0,
        legFrontDip: pose === "stretch" ? 12 : 0,
        bodyDipY: pose === "stretch" ? 9 : 0,
      };
    }

    // The one place that actually draws. Every call — whether from a timer,
    // a pointer event, or the continuous loop below — eases `current`
    // toward computeTarget()'s posture using real elapsed time (delta-time,
    // not frame count), so calling it at an odd moment never shows as a
    // jump cut. render.override (jump's per-phase posture) still wins
    // outright where it's set, layered on after the ease.
    function render() {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastRenderTime) / 1000);
      lastRenderTime = now;
      const target = computeTarget(now / 1000);
      // Reduced motion never gets a follow-up frame to finish easing on
      // (the continuous loop below is never started), so it snaps outright
      // rather than freezing mid-ease.
      const factor = prefersReducedMotion ? 1 : 1 - Math.exp(-18 * dt);
      SMOOTH_KEYS.forEach((k) => {
        current[k] += (target[k] - current[k]) * factor;
      });
      current.dir = target.dir;
      current.front = target.front;
      current.blink = target.blink;
      current.sleeping = target.sleeping;
      current.grooming = target.grooming;
      current.earFlat = target.earFlat;
      draw(ctx, Object.assign({}, current, render.override || {}));
    }
    render.override = null;

    // Keeps render() running at display refresh rate for as long as the
    // page allows animation at all — idle breathing/tail-sway are
    // themselves continuous waves, so there's no "settled" point to stop
    // at the way a one-off transition would have. Reduced motion never
    // starts this; every render() call it does make (state changes still
    // trigger a few) is a plain snap-to-target, one frame, no loop.
    function loop() {
      render();
      requestAnimationFrame(loop);
    }

    function placeOn(platform) {
      const w = canvas.offsetWidth || 90;
      const h = canvas.offsetHeight || 74;
      // Centered over the platform, but never pushed past the true
      // viewport edge — some ledges (the short stepping-stones) are
      // narrower than the cat itself, and centering alone would hang it
      // off-screen on those.
      const centered = platform.offsetLeft + platform.offsetWidth / 2 - w / 2;
      const left = clamp(centered, 4, window.innerWidth - w - 4);
      const top = platform.offsetTop - h + h * 0.28;
      canvas.style.left = `${left}px`;
      canvas.style.top = `${top}px`;
    }

    function spawnDust(x, y) {
      if (prefersReducedMotion) return;
      const count = 3;
      for (let i = 0; i < count; i++) {
        const d = document.createElement("span");
        d.className = "cat-dust";
        d.style.left = `${x + (Math.random() - 0.5) * 20}px`;
        d.style.top = `${y}px`;
        d.style.setProperty("--dx", `${(Math.random() - 0.5) * 30}px`);
        worldEl.appendChild(d);
        setTimeout(() => d.remove(), 500);
      }
    }

    function scheduleBlink() {
      if (prefersReducedMotion) return;
      clearTimeout(blinkTimerId);
      blinkTimerId = setTimeout(() => {
        blink = true;
        if (pose !== "jump") render();
        setTimeout(() => {
          blink = false;
          if (pose !== "jump") render();
          scheduleBlink();
        }, 130);
      }, 2400 + Math.random() * 2800);
    }

    function scheduleGlance() {
      if (prefersReducedMotion || canLook) return; // desktop uses live cursor-look instead
      clearTimeout(glanceTimerId);
      glanceTimerId = setTimeout(() => {
        if (pose === "idle" || pose === "sit") {
          lookX = (Math.random() - 0.5) * 6;
          lookY = (Math.random() - 0.5) * 3;
          render();
          setTimeout(() => {
            lookX = 0;
            lookY = 0;
            render();
          }, 500);
        }
        scheduleGlance();
      }, 3500 + Math.random() * 4000);
    }

    // ---- walk to an explicit x (px, relative to worldEl), decelerating in ----
    function walkTo(targetLeft, duration, onDone) {
      const startLeft = parseFloat(canvas.style.left) || 0;
      if (Math.abs(targetLeft - startLeft) < 4) {
        onDone && onDone();
        return;
      }
      dir = targetLeft >= startLeft ? 1 : -1;
      running = Math.abs(targetLeft - startLeft) > 70;
      pose = "walk";
      render();
      // The grass underfoot sways gently while it's actually being walked
      // on (see .platform.is-active in styles.css) — cleared as soon as
      // the walk phase ends, whether that leads into a jump or just idle.
      if (platformEl) platformEl.classList.add("is-active");
      const start = performance.now();
      clearInterval(walkStepTimer);
      walkStepTimer = setInterval(() => {
        const t = Math.min(1, (performance.now() - start) / duration);
        const eased = 1 - Math.pow(1 - t, 2); // ease-out — visibly slows approaching the target
        canvas.style.left = `${startLeft + (targetLeft - startLeft) * eased}px`;
        render();
        if (t >= 1) {
          clearInterval(walkStepTimer);
          if (platformEl) platformEl.classList.remove("is-active");
          onDone && onDone();
        }
      }, 33);
    }

    // ---- the full, watchable jump sequence: walk to the platform's edge,
    // pause/crouch, spring into a real parabolic arc, land with a bounce.
    // Duration and arc height scale with the actual distance, so a short
    // hop reads as a hop and a rare cross-world jump reads as a bigger,
    // still-readable leap rather than a teleport. ----
    function goTo(target) {
      if (busy() || !target || !platformEl) return;
      const cur = platformEl;
      const catW = canvas.offsetWidth;
      const curLeft = parseFloat(canvas.style.left) || 0;
      const targetCenterLeft = target.offsetLeft + target.offsetWidth / 2 - catW / 2;
      const goingRight = targetCenterLeft >= curLeft;
      const margin = 8;
      const curLeftBound = cur.offsetLeft + margin;
      const curRightBound = Math.max(curLeftBound, cur.offsetLeft + cur.offsetWidth - catW - margin);
      let edgeLeft = goingRight ? Math.min(curRightBound, targetCenterLeft) : Math.max(curLeftBound, targetCenterLeft);
      edgeLeft = clamp(edgeLeft, curLeftBound, curRightBound);
      const walkDist = Math.abs(edgeLeft - curLeft);

      function ready() {
        // "Look toward destination" is folded into the crouch hold itself
        // (eyes already committed to the jump direction from the moment
        // it starts, held the whole time) rather than a separate beat —
        // idle/sit/groom are drawn front-facing while crouch/jump use the
        // side rig, so inserting a standalone look pose here would mean
        // an extra front→side flip on top of the one crouch already is.
        dir = goingRight ? 1 : -1;
        lookX = dir * 4;
        lookY = -1;
        pose = "crouch";
        render();
        setTimeout(() => launchJump(edgeLeft, target, targetCenterLeft, dir), CROUCH_MS + 140);
      }

      if (walkDist > 4) {
        walkTo(edgeLeft, clamp(walkDist / 0.42, 260, 900), ready);
      } else {
        ready();
      }
    }

    function launchJump(fromLeft, target, toLeft, jumpDir) {
      pose = "jump";
      dir = jumpDir;
      platformEl = target;
      const fromTop = parseFloat(canvas.style.top) || 0;
      const h = canvas.offsetHeight || 74;
      const toTop = target.offsetTop - h + h * 0.28;
      const dist = Math.hypot(toLeft - fromLeft, toTop - fromTop);
      const duration = clamp(300 + dist * 0.55, 600, 1100);
      const arc = clamp(40 + dist * 0.09, 46, 130);
      const start = performance.now();

      // Five readable phases rather than one continuous formula — matches
      // a real jump's own beats: compressed takeoff, extending ascent, a
      // stretched-out peak with legs tucked, front paws reaching forward
      // as it descends, then gathering for landing. Each phase interpolates
      // its own start/end values (lerp helper below) so there's no seam
      // between them.
      function lerp(a, b, k) {
        return a + (b - a) * k;
      }

      function tick(now) {
        const t = Math.min(1, (now - start) / duration);
        const x = fromLeft + (toLeft - fromLeft) * t;
        const y = fromTop + (toTop - fromTop) * t - Math.sin(t * Math.PI) * arc;
        canvas.style.left = `${x}px`;
        canvas.style.top = `${y}px`;

        let squashX, squashY, legBackY, legFrontA, legFrontB, tailAngle;
        if (t < 0.12) {
          // takeoff — compressed, hind legs still pushing off the ground
          const k = t / 0.12;
          squashX = lerp(1.16, 1.06, k);
          squashY = lerp(0.8, 0.9, k);
          legBackY = lerp(4, -10, k);
          legFrontA = lerp(-2, -8, k);
          legFrontB = lerp(-4, -10, k);
          tailAngle = jumpDir * lerp(-4, -16, k);
        } else if (t < 0.42) {
          // ascending — body extending, legs tucking up underneath
          const k = (t - 0.12) / 0.3;
          squashX = lerp(1.06, 0.97, k);
          squashY = lerp(0.9, 1.04, k);
          legBackY = lerp(-10, -20, k);
          legFrontA = lerp(-8, -15, k);
          legFrontB = lerp(-10, -17, k);
          tailAngle = jumpDir * lerp(-16, -24, k);
        } else if (t < 0.55) {
          // peak — stretched and light, everything tucked
          squashX = 0.97;
          squashY = 1.05;
          legBackY = -20;
          legFrontA = -15;
          legFrontB = -17;
          tailAngle = jumpDir * -25;
        } else if (t < 0.88) {
          // descending — front paws reach forward to meet the ground
          const k = (t - 0.55) / 0.33;
          squashX = lerp(0.97, 1.05, k);
          squashY = lerp(1.05, 0.9, k);
          legBackY = lerp(-20, -6, k);
          legFrontA = lerp(-15, 10, k);
          legFrontB = lerp(-17, 12, k);
          tailAngle = jumpDir * lerp(-25, -12, k);
        } else {
          // final approach — gathering for contact
          const k = (t - 0.88) / 0.12;
          squashX = lerp(1.05, 1.1, k);
          squashY = lerp(0.9, 0.85, k);
          legBackY = lerp(-6, 2, k);
          legFrontA = lerp(10, 6, k);
          legFrontB = lerp(12, 6, k);
          tailAngle = jumpDir * lerp(-12, -8, k);
        }

        render.override = {
          tilt: jumpDir * (6 + Math.sin(t * Math.PI) * 9),
          squashX,
          squashY,
          legBackY,
          legFrontA,
          legFrontB,
          tailAngle,
          earFlat: t < 0.5,
        };
        render();
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          land(x, y, h, target);
        }
      }
      requestAnimationFrame(tick);
    }

    function land(x, y, h, target) {
      // Two beats, not one static squash: front paws contact and compress
      // hard, hind legs follow a moment later as it settles — then release
      // into a small recovery bounce before returning to idle/sit.
      render.override = { squashX: 1.2, squashY: 0.76, tilt: 0, legFrontA: 6, legFrontB: 6, legBackY: 4, tailAngle: dir * -4 };
      render();
      spawnDust(x + canvas.offsetWidth / 2, y + h);
      target.classList.remove("is-landed");
      void target.offsetWidth;
      target.classList.add("is-landed");
      setTimeout(() => target.classList.remove("is-landed"), 420);
      setTimeout(() => {
        render.override = { squashX: 0.95, squashY: 1.04, legBackY: -3, tailAngle: dir * 3 };
        render();
      }, 110);
      setTimeout(() => {
        render.override = null;
        const r = Math.random();
        pose = r < 0.12 ? "sleep" : r < 0.45 ? "sit" : "idle";
        render();
        scheduleLocal();
      }, 260);
    }

    // Weighted toward nearby platforms so the cat mostly hops locally, but
    // an occasional farther/cross-side jump can still be picked — never
    // forced, never impossible.
    function pickWeighted(candidates, fromLeft) {
      const weights = candidates.map((p) => 1 / (Math.abs(p.offsetLeft + p.offsetWidth / 2 - fromLeft) + 60));
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      for (let i = 0; i < candidates.length; i++) {
        r -= weights[i];
        if (r <= 0) return candidates[i];
      }
      return candidates[candidates.length - 1];
    }

    // The farthest candidate — deliberately picked on a regular schedule
    // (see the callers below) so a full left↔right crossing is something
    // that actually happens, not just a rare long tail of pickWeighted.
    function pickFarthest(candidates, fromLeft) {
      let best = candidates[0];
      let bestD = -1;
      candidates.forEach((p) => {
        const d = Math.abs(p.offsetLeft + p.offsetWidth / 2 - fromLeft);
        if (d > bestD) {
          bestD = d;
          best = p;
        }
      });
      return best;
    }

    // Remembers the last few landed-on platforms so picks are steered away
    // from them — over a handful of jumps the cat actually visits every
    // ledge in the world instead of a random weighting quietly favoring
    // the same two or three forever.
    let recentlyVisited = [];
    function pickJumpTarget(candidates, fromLeft) {
      let pool = candidates.filter((p) => !recentlyVisited.includes(p));
      if (!pool.length) pool = candidates;
      const target = Math.random() < 0.4 ? pickFarthest(pool, fromLeft) : pickWeighted(pool, fromLeft);
      recentlyVisited.push(target);
      if (recentlyVisited.length > 4) recentlyVisited.shift();
      return target;
    }

    // ---- while the page is still: potter around on the CURRENT platform
    // only (a short walk, a sit, a doze) — never a cross-platform jump.
    // Jumping is scroll's job (see tryScrollJump below), so the cat is
    // never fully static, but doesn't wander off on its own between
    // scrolls either. ----
    function localActivity() {
      if (busy() || document.hidden) {
        scheduleLocal();
        return;
      }
      const r = Math.random();
      if (r < 0.22) {
        // jump to another ledge on its own, not just when the page scrolls
        const others = visiblePlatforms().filter((p) => p !== platformEl);
        if (others.length) {
          const curLeft = parseFloat(canvas.style.left) || 0;
          goTo(pickJumpTarget(others, curLeft));
          return;
        }
        pose = "idle";
        render();
        scheduleLocal();
      } else if (r < 0.5 && platformEl) {
        const catW = canvas.offsetWidth;
        const margin = 8;
        const minL = platformEl.offsetLeft + margin;
        const maxL = Math.max(minL, platformEl.offsetLeft + platformEl.offsetWidth - catW - margin);
        const target = minL + Math.random() * (maxL - minL);
        walkTo(target, clamp(Math.abs(target - (parseFloat(canvas.style.left) || 0)) / 0.4, 300, 900), () => {
          pose = Math.random() < 0.3 ? "sit" : "idle";
          render();
          scheduleLocal();
        });
      } else if (r < 0.68) {
        pose = "sit";
        render();
        scheduleLocal();
      } else if (r < 0.78) {
        pose = "sleep";
        render();
        scheduleLocal();
      } else if (r < 0.88) {
        // a stretch — held briefly, then back to idle
        pose = "stretch";
        render();
        setTimeout(() => {
          pose = "idle";
          render();
          scheduleLocal();
        }, 750);
      } else if (r < 0.96) {
        // a quick grooming pause
        pose = "groom";
        render();
        setTimeout(() => {
          pose = "idle";
          render();
          scheduleLocal();
        }, 1100);
      } else {
        pose = "idle";
        render();
        scheduleLocal();
      }
    }

    function scheduleLocal() {
      clearTimeout(localTimer);
      const min = isCompact ? 4500 : 2200;
      const max = isCompact ? 9000 : 4200;
      localTimer = setTimeout(localActivity, min + Math.random() * (max - min));
    }

    // ---- scrolling is the jump trigger: rate-limited (so one continuous
    // scroll gesture doesn't fire a dozen jumps), but not probabilistic —
    // the first scroll after the cooldown clears always jumps. ----
    let lastScrollJump = 0;
    function tryScrollJump() {
      if (prefersReducedMotion) return;
      const now = performance.now();
      if (busy() || now - lastScrollJump < 1800) return;
      const others = visiblePlatforms().filter((p) => p !== platformEl);
      if (!others.length) return;
      lastScrollJump = now;
      const curLeft = parseFloat(canvas.style.left) || 0;
      goTo(pickJumpTarget(others, curLeft));
    }

    // Placed once at startup — the world is one persistent layer now, not
    // remounted per section, so there is nothing to re-enter on scroll.
    function start() {
      const platforms = visiblePlatforms();
      if (!platforms.length) return;
      platformEl = platforms[Math.floor(Math.random() * platforms.length)];
      worldEl.appendChild(canvas);
      placeOn(platformEl);
      canvas.style.opacity = "1";
      if (prefersReducedMotion) {
        render();
        return;
      }
      lastRenderTime = performance.now();
      loop();
      scheduleLocal();
      window.addEventListener("scroll", tryScrollJump, { passive: true });
    }

    // Click to pet — a deliberate, content reaction (eyes close, tail
    // curls and gives a happy little wag) rather than the old startled
    // bounce-on-any-approach. Only a real click triggers it now; getting
    // near no longer does anything by itself beyond the look below.
    let lastPetAt = 0;
    function pet() {
      if (prefersReducedMotion || busy()) return;
      const now = Date.now();
      if (now - lastPetAt < 500) return; // ignore a rapid double-click as one pet, not two
      lastPetAt = now;
      pose = "pet";
      render();
      setTimeout(() => {
        pose = "idle";
        render();
        scheduleLocal();
      }, 900);
    }
    canvas.addEventListener("pointerdown", pet);

    // ---- cursor awareness, deliberately just two behaviors: ----
    // 1. LOOK — the eyes/head track the cursor continuously, always on.
    // 2. WALK toward it — an occasional, cooldown-gated decision, only
    //    when idle/sitting, never a continuous chase.
    // (No more "jump toward the cursor" and no more a hover-proximity
    // bounce — both made the cat feel like it was reacting randomly to
    // just being near the mouse.)
    if (canLook && !prefersReducedMotion) {
      window.addEventListener(
        "pointermove",
        (e) => {
          if (!platformEl) return;

          if (!busy()) {
            const r = canvas.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const d = Math.hypot(dx, dy) || 1;
            lookX = clamp((dx / d) * 5, -4, 4);
            lookY = clamp((dy / d) * 3, -2.5, 2.5);
            render();
          }

          const now = performance.now();
          if (now - lastCursorCheck < 280) return;
          lastCursorCheck = now;
          if (busy() || now < cursorCooldownUntil) return;
          if (pose !== "idle" && pose !== "sit") return;

          const r = canvas.getBoundingClientRect();
          const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));

          if (dist < WALK_NOTICE_RANGE && Math.random() < 0.5) {
            const worldRect = worldEl.getBoundingClientRect();
            const cur = platformEl;
            const catW = canvas.offsetWidth;
            const margin = 10;
            const targetLeft = clamp(
              e.clientX - worldRect.left - catW / 2,
              cur.offsetLeft + margin,
              cur.offsetLeft + cur.offsetWidth - catW - margin
            );
            cursorCooldownUntil = now + 3500 + Math.random() * 3000;
            walkTo(targetLeft, clamp(Math.abs(targetLeft - (parseFloat(canvas.style.left) || 0)) / 0.4, 260, 800), () => {
              pose = "idle";
              render();
              scheduleLocal();
            });
          }
        },
        { passive: true }
      );
    }

    window.addEventListener(
      "resize",
      () => {
        if (platformEl && !busy()) placeOn(platformEl);
      },
      { passive: true }
    );

    scheduleBlink();
    scheduleGlance();
    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
