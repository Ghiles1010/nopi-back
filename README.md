# LMNP Chatbot Backend

Node.js backend powered by LangChain for the LMNP simulator chatbot.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Run the chatbot:**
   ```bash
   npm run dev
   ```

## Features

- **LangChain Integration**: Uses OpenAI's GPT models via LangChain
- **Data Extraction**: Automatically extracts investment data from natural language
- **Tax Simulations**: Calculates Micro-BIC vs Régime réel comparisons
- **Conversation Memory**: Maintains context throughout the conversation

## Project Structure

```
src/
├── index.js       # Entry point
└── chatbot.js     # Main chatbot logic with LangChain

```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `MODEL_NAME`: Model to use (default: gpt-4)
- `TEMPERATURE`: LLM temperature (default: 0.7)
- `MAX_TOKENS`: Maximum tokens (default: 1000)

## Usage

```javascript
import { chatbot } from './src/index.js';

const response = await chatbot.processMessage(
  "J'achète un studio à 150 000€, loyer 800€/mois",
  conversationHistory
);

console.log(response);
// {
//   reply: "AI response text",
//   state: { prix_achat, loyer_mensuel, charges_annuelles, duree },
//   simulation: { micro_bic, reel }
// }
```

