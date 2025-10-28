import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { InfoStateSchema } from '../../agents/chatbot/infoState.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Investment Data Extractor Agent
 * Uses LLM with structured output (Zod schema) for type-safe data extraction
 * More accurate than regex and can understand context
 */
export class InvestmentExtractor {
  constructor() {
    // Create LLM with low temperature for deterministic extraction
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: process.env.MODEL_NAME || 'gpt-3.5-turbo-1106',
      temperature: 0, // Deterministic for data extraction
    });

    // Create prompt template
    this.createPromptTemplate();
  }

  /**
   * Create prompt template with variables
   */
  createPromptTemplate() {
    try {
      const promptPath = join(__dirname, './extraction_prompt.txt');
      const basePrompt = readFileSync(promptPath, 'utf-8');
      
      // Create prompt template with variable
      this.promptTemplate = ChatPromptTemplate.fromMessages([
        ['system', basePrompt],
        ['human', 'Messages utilisateur à analyser:\n\n{input}'],
      ]);
    } catch (error) {
      console.error('Error loading extraction prompt file, using default:', error.message);
      this.promptTemplate = ChatPromptTemplate.fromMessages([
        ['system', 'Tu es un expert en extraction de données d\'investissement immobilier LMNP.'],
        ['human', '{input}'],
      ]);
    }
  }

  /**
   * Extract investment data from conversation messages using structured output
   * @param {string|Array} messages - Single message or array of conversation messages
   * @param {Object} currentState - Current known state to merge with
   * @returns {Object} Extracted investment data
   */
  async extractData(messages, currentState = {}) {
    try {
      // Combine messages into a single context if it's an array
      const inputText = Array.isArray(messages) 
        ? messages.map(m => typeof m === 'string' ? m : m.content || '').join('\n')
        : messages;

      // Format prompt with LangChain template
      const llmMessages = await this.promptTemplate.formatMessages({
        input: inputText
      });

      // Call LLM
      const response = await this.llm.invoke(llmMessages);
      
      // Parse JSON response
      const responseText = response.content || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.warn('No JSON found in extraction response');
        return currentState;
      }

      // Parse and validate with Zod schema (single source of truth from InfoState)
      const parsedData = JSON.parse(jsonMatch[0]);
      const extracted = InfoStateSchema.parse(parsedData);

      // Merge with current state (preserve existing non-null values)
      const merged = {
        prix_achat: extracted.prix_achat ?? currentState.prix_achat ?? null,
        loyer_mensuel: extracted.loyer_mensuel ?? currentState.loyer_mensuel ?? null,
        charges_annuelles: extracted.charges_annuelles ?? currentState.charges_annuelles ?? null,
        duree: extracted.duree ?? currentState.duree ?? null,
      };

      return merged;
    } catch (error) {
      console.error('Error in extraction:', error);
      return currentState;
    }
  }

  /**
   * Check if extracted data is complete enough for simulation
   */
  isComplete(data) {
    return !!(data.prix_achat && data.loyer_mensuel && data.charges_annuelles && data.duree);
  }
}

