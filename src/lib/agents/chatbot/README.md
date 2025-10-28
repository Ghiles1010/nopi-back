# Chatbot Agent

Conversation agent that orchestrates the AI‑first flow: it talks to the user, keeps conversation memory, injects current state/simulation context into prompts, and collaborates with the Extractor to keep structured variables up‑to‑date.

## Role

- Greets the user with a welcome message (seeded in constructor)
- Guides the conversation to collect missing variables
- Calls the LLM with rich context (state JSON + simulation text + history)
- Updates memory and triggers extraction after each turn

## Files

- `chatbot.js`: main agent implementation
- `infoState.js`: state model (prix_achat, loyer_mensuel, charges_annuelles, duree)
- `memory.js`: minimal in‑memory conversation store
- `system_prompt.txt`: system instructions injected in each prompt

## Prompt Structure

```
System: system_prompt.txt
Placeholder: {chat_history}
Human: {input}
```

Additionally injected variables:
- `{state_json}`: current `InfoState` serialized
- `{simulation_results}`: formatted results from `TaxSimulator.toString()` when available

## Public API

- `constructor()`: initializes memory, extractor, simulator, prompt, and seeds a welcome message
- `async processMessage(message: string)`: updates memory, creates a prompt, calls the LLM, stores AI message, runs extraction, updates state
- `async getReply()`: returns the last AI reply from memory
- `isDone()`: returns whether required fields are complete (via Extractor)
- `async getHistoryArray()`: returns a simplified array `{ role, content }`
- `async resetMemory()`: clears memory and state

## Extension Points

- Replace model/config via environment variables (`MODEL_NAME`, `TEMPERATURE`, `MAX_TOKENS`)
- Tweak `system_prompt.txt` to change tone and behavior
- Add tools or function‑calling to extend capabilities (e.g., persistence)

## Error Handling

- Any LLM or extraction errors are caught and logged; the agent returns a generic error up the stack. Math is deterministic and never delegated to the LLM.


