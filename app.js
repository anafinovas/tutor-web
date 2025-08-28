import { complete, initLLM } from "./llm.js";
const statusEl = document.getElementById("status");

if (!('gpu' in navigator)) {
  // LINE 1 — just inform, don't use "e" here
  statusEl.textContent = "This device can’t run the local model. Try Chrome/Edge on a desktop/laptop.";
} else {
  (async () => {
    try {
      statusEl.textContent = "Loading model… first time can take ~1 minute.";
      await initLLM();
      statusEl.textContent = "Model ready ✅";
    } catch (e) {
      console.error(e);
      // LINE 2 — show the real error text
      statusEl.textContent = "Model failed to load: " + ((e && e.message) ? e.message : String(e));
    }
  })();
}
const log = document.getElementById("log");
const form = document.getElementById("form");
const input = document.getElementById("input");
const history = [];

function add(role, text) {
  const div = document.createElement("div");
  div.className = role;
  div.textContent = (role === "user" ? "You: " : "Tutor: ") + text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  add("user", text);

  try {
    const reply = await complete(text, history);
    add("assistant", reply);
    history.push({ role: "user", content: text });
    history.push({ role: "assistant", content: reply });
    while (history.length > 8) history.shift(); // keep small for speed
  } catch (err) {
    console.error(err);
    add("assistant", "Something went wrong. Try again with a short question.");
  }
});
