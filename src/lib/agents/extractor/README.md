# Extractor Agent

Structured‑output agent that converts free‑form conversation into typed investment variables using LangChain + Zod validation.

## Role

- Parse conversation history to infer: `prix_achat`, `loyer_mensuel`, `charges_annuelles`, `duree`
- Validate against a schema (single source of truth) to keep the state consistent
- Merge newly extracted values with existing state without overwriting known non‑null fields

## Files

- `extractor.js`: agent implementation
- `extraction_prompt.txt`: system instructions and examples for robust extraction

## How it Works

1. Concatenate history into a single text
2. Format prompt (system + user input block)
3. Call `ChatOpenAI` at low temperature for determinism
4. Parse JSON from the model output (guarded)
5. Validate with Zod schema from `infoState.js`
6. Merge into current state

## Completeness Check

The extractor exposes `isComplete(data)` used by the Chatbot to decide when to request a simulation. Adjust it according to which fields the calculator needs.

## Tuning

- Add few‑shot examples in `extraction_prompt.txt`
- Keep temperature at 0 for reproducible extraction
- Extend the schema if you want to capture more variables later


