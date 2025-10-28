# LMNP Chatbot Backend

Node.js backend (Express + LangChain) powering the AI‑first LMNP simulator. It manages sessions, converses with the user, extracts structured investment data, and computes simple Micro‑BIC vs Réel simulations.

## Overview

- **Session‑scoped Chatbot**: Each `x-session-id` has an in‑memory `Chatbot` with its own message history and extracted state.
- **Two Agents**:
  - Chatbot: drives the conversation and answers the user.
  - Extractor: parses conversation history into structured variables (prix_achat, loyer_mensuel, charges_annuelles, duree) with a Zod schema.
- **Deterministic Math**: All calculations are done server‑side to avoid hallucinations.

### High‑level Flow

```
User → POST /api/chat → ChatView
  → SessionManager.getChatbot(sessionId)
  → Chatbot.processMessage()
       ↳ builds prompt (system + chat_history + input + simulation context)
       ↳ LLM answer → memory.addAIMessage()
       ↳ Extractor.extractData(history) → infoState.update()
  → If complete → TaxSimulator.calculate(state)
  → Response { reply, simulation|null, sessionId }

Frontend on load → GET /api/state → StateView
  → returns { state, isDone, history, sessionId }
```

## HTTP API

- `POST /api/chat`
  - Request JSON: `{ message: string, conversation_history?: string[] }`
  - Headers: `x-session-id: <string>`
  - Response: `{ reply: string, simulation: {...}|null, sessionId: string }`

- `GET /api/state`
  - Headers: `x-session-id: <string>`
  - Response: `{ state, isDone, history, sessionId }`

- `POST /api/reset`
  - Resets the session’s memory and extracted state.

- `GET /health`
  - Health probe.

## Architecture

```
src/
├── api/
│   ├── server.js           # Express app and routes
│   ├── session.js          # SessionManager (per-session Chatbot lifecycle)
│   └── views/
│       ├── ChatView.js     # POST /api/chat handler
│       ├── StateView.js    # GET  /api/state handler
│       └── ResetView.js    # POST /api/reset handler
├── lib/
│   ├── agents/
│   │   ├── chatbot/        # Conversation agent
│   │   │   ├── chatbot.js
│   │   │   ├── infoState.js
│   │   │   ├── memory.js
│   │   │   └── system_prompt.txt
│   │   └── extractor/      # Structured extraction agent
│   │       ├── extractor.js
│   │       └── extraction_prompt.txt
│   └── simulator.js        # Deterministic tax calculation
└── index.js                # CLI (optional)
```

### Key Components

- `SessionManager`
  - Map of `sessionId → { chatbot, createdAt, lastAccessed }`
  - Creates a new `Chatbot` when a session is first seen
  - Garbage‑collection hook available via `cleanup()`

- `Chatbot`
  - Maintains `ConversationMemory` and `InfoState`
  - Builds prompts using `system_prompt.txt` + chat history + state/simulation context
  - Seeds a welcome AI message at construction time
  - Invokes `Extractor` to keep state updated after each turn

- `Extractor`
  - LangChain `ChatOpenAI` with a structured prompt
  - Validates results with Zod schema from `InfoState`
  - Merges newly extracted values with existing state
  - Completeness check gates simulation

- `TaxSimulator`
  - Computes simplified Micro‑BIC vs Réel
  - Returns both regimes and a human‑readable string used in prompts

## Environment

- `OPENAI_API_KEY` (required)
- `MODEL_NAME` (default: `gpt-3.5-turbo-1106`)
- `TEMPERATURE` (default: `0.3`)
- `MAX_TOKENS` (default: `500`)

Provide these via a `.env` mounted at `/app/.env` in Docker, or as Docker `-e` variables.

## Running (Docker + Taskfile)

```bash
cd nopi-back
# Build image
task build
# Start container with .env mounted
task up
# Stop/remove container
task down
# Remove image + container
task clean
```

The container exposes port `3001`. In production we place nginx in front and proxy `/api/*` to the backend.

## Agents Documentation

- Chatbot Agent: see `src/lib/agents/chatbot/README.md`
- Extractor Agent: see `src/lib/agents/extractor/README.md`

Each README explains the agent’s role, inputs/outputs, prompt design, and extension points.

## Deployment Notes

- Exposed port: `3001`
- Health endpoint: `/health`
- Typical reverse proxy: `location /api/ { proxy_pass http://127.0.0.1:3001; }`

See the frontend README for nginx frontend routing and the repository’s Docker READMEs for containerized builds.

