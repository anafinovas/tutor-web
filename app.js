import { complete, initLLM } from "./llm.js";
  }
  throw new Error("WebLLM script failed to load from all sources.");
}

const statusEl = document.getElementById("status");

if (!('gpu' in navigator)) {
  // CHANGE #1: no 'e' here – just tell the user this device can't run local
  statusEl.textContent = "This device can’t run the local model. Try Chrome/Edge on a desktop/laptop.";
} else {
  (async () => {
    try {
      statusEl.textContent = "Loading model… first time can take ~1 minute.";
      // NEW: load the library itself
      await initLLM();             // then init the model
      statusEl.textContent = "Model ready ✅";
    } catch (e) {
      console.error(e);
      // CHANGE #2: show the real error text *inside* the catch
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

