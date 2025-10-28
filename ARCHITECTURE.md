# Chatbot Architecture

## Features Implemented

### 1. **System Prompt Template** (`prompts/system_prompt.txt`)
- Centralized system prompt for easy editing
- Loaded dynamically at runtime
- Contains expert knowledge about LMNP fiscalité
- Explains Micro-BIC and Régime réel
- Guides conversation flow

### 2. **Conversation Memory** (`src/memory.js`)
- **ConversationMemory** class maintains full chat history
- Tracks all user messages and AI responses
- Preserves context across multiple exchanges
- Simple in-memory storage (no external dependencies)

### 3. **Chatbot Core** (`src/chatbot.js`)
- Loads system prompt from file
- Integrates conversation memory
- Processes messages with full context
- Extracts investment data from natural language
- Calculates tax simulations (Micro-BIC vs Régime réel)

## How It Works

### Conversation Flow:
1. User sends message → `processMessage(message)`
2. Add to memory → `memory.addUserMessage(message)`
3. Get full history → `memory.getHistory()`
4. Call LLM with: System prompt + All history
5. Get response → Add to memory
6. Extract data & calculate simulation
7. Return `{ reply, state, simulation }`

### Memory Benefits:
- ✅ AI remembers previous messages
- ✅ Can answer follow-up questions
- ✅ Maintains context about investment details
- ✅ Conversation feels natural, not repetitive

### Example Output:
```javascript
{
  reply: "AI response with context awareness",
  state: {
    prix_achat: 150000,
    loyer_mensuel: 800,
    charges_annuelles: 1200,
    duree: 10
  },
  simulation: {
    micro_bic: { revenus, impots, net_apres_impots },
    reel: { revenus, impots, net_apres_impots }
  }
}
```

## Testing

Run: `npm run dev`

Test conversation flow with multiple exchanges to verify memory persistence.

## Next Steps

- Add HTTP server (Express/Fastify)
- Create `/api/chat` endpoint
- Connect to React frontend

