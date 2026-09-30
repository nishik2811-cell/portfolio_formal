// Floating chat widget. Talks to /api/chat (see api/chat.js).
(() => {
  const GREETING =
    "Hi! Ask me about Nishita's projects, education, skills, or how to get in touch.";
  const FALLBACK =
    "I couldn't reach the assistant. You can email Nishita at nishik2811@gmail.com.";

  const history = [];
  let busy = false;

  const root = document.createElement("div");
  root.className = "chat";
  root.innerHTML = `
    <section class="chat-panel" id="chatPanel" role="dialog" aria-label="Chat about Nishita" hidden>
      <header class="chat-panel__head">
        <span>Ask about Nishita</span>
        <button type="button" class="chat-panel__close" aria-label="Close chat">&times;</button>
      </header>
      <div class="chat-log" role="log" aria-live="polite"></div>
      <form class="chat-form">
        <input type="text" maxlength="500" placeholder="Ask a question…" aria-label="Your message" autocomplete="off" />
        <button type="submit" aria-label="Send">&rarr;</button>
      </form>
    </section>
    <button type="button" class="chat-fab" aria-label="Open chat" aria-expanded="false" aria-controls="chatPanel">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z"/>
      </svg>
    </button>`;
  document.body.appendChild(root);

  const panel = root.querySelector(".chat-panel");
  const fab = root.querySelector(".chat-fab");
  const log = root.querySelector(".chat-log");
  const form = root.querySelector(".chat-form");
  const input = form.querySelector("input");
  const sendBtn = form.querySelector("button");

  const esc = (s) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // Escape first, then allow only markdown links to http(s), mailto, or the resume.
  const renderBot = (s) =>
    esc(s.trim().replace(/\n{3,}/g, "\n\n"))
      .replace(/^[ \t]*[-*] /gm, "• ")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|resume\.pdf)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );

  function addMsg(role, text) {
    const el = document.createElement("div");
    el.className = `chat-msg chat-msg--${role}`;
    if (role === "bot") el.innerHTML = renderBot(text);
    else el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function setOpen(open) {
    panel.hidden = !open;
    fab.setAttribute("aria-expanded", String(open));
    fab.setAttribute("aria-label", open ? "Close chat" : "Open chat");
    root.classList.toggle("is-open", open);
    if (open) input.focus();
    else fab.focus();
  }

  fab.addEventListener("click", () => setOpen(panel.hidden));
  root.querySelector(".chat-panel__close").addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) setOpen(false);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    input.value = "";
    busy = true;
    sendBtn.disabled = true;

    addMsg("user", text);
    history.push({ role: "user", content: text });
    const typing = addMsg("bot", "…");
    typing.classList.add("chat-msg--typing");

    let reply = FALLBACK;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 65000);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-6) }),
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (data.reply) reply = data.reply;
      if (res.ok) history.push({ role: "assistant", content: reply });
      else history.pop();
    } catch {
      history.pop();
    } finally {
      clearTimeout(timer);
    }

    typing.remove();
    addMsg("bot", reply);
    busy = false;
    sendBtn.disabled = false;
    input.focus();
  });

  addMsg("bot", GREETING);
})();
