let engine;

const SYSTEM = `
You are a bilingual educational tutor (English & Hungarian).
- Detect the student's language each turn and answer in that language.
- Only discuss curriculum topics and study skills.
- If unsafe or off-topic, refuse briefly and suggest a safe course topic.
- Be concise; give small, clear steps.
`;

export async function initLLM() {
  if (engine) return engine;
  const { CreateMLCEngine } = window.webllm;
  engine = await CreateMLCEngine({
    model: "Llama-3.2-1B-Instruct-q4f16_1-MLC",  // tiny browser model
    gpu_preferred: true
  });
  return engine;
}

export async function complete(userText, history = []) {
  await initLLM();
  const messages = [
    { role: "system", content: SYSTEM },
    ...history,
    { role: "user", content: userText }
  ];
  const out = await engine.chat.completions.create({
    messages,
    temperature: 0.2,
    max_tokens: 64
  });
  return out.choices?.[0]?.message?.content ?? "";
}
