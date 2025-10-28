import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConversationMemory } from './memory.js';
import { InvestmentExtractor } from '../../agents/extractor/extractor.js';
import InfoState from './infoState.js';
import { TaxSimulator } from '../../simulator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Chatbot class for LMNP simulator
 * Handles conversations and extracts property investment data
 */
export class Chatbot {
  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: process.env.MODEL_NAME || 'gpt-3.5-turbo-1106',
      temperature: parseFloat(process.env.TEMPERATURE || '0.3'),
      maxTokens: parseInt(process.env.MAX_TOKENS || '500'),
    });

    // Initialize conversation memory
    this.memory = new ConversationMemory();
    
    // Initialize data extractor agent
    this.extractor = new InvestmentExtractor();
    
    // Initialize simulator for calculations
    this.simulator = new TaxSimulator();
    
    // Track extracted state across conversation (Pydantic-like model)
    this.infoState = new InfoState();

    // Create dynamic prompt template
    this.createPromptTemplate();

    // Seed a welcome message immediately for a fresh session
    this.addInitialMessage();
  }

  /**
   * Optionally add a welcome message at session creation
   */
  addInitialMessage() {
    // Synchronous check to ensure the message is present before first read
    if (!this.memory) return;
    const hasHistory = Array.isArray(this.memory.history) && this.memory.history.length > 0;
    if (!hasHistory) {
      this.memory.addAIMessage(
        "Bonjour! Comment puis-je t'aider aujourd'hui en matière d'investissement immobilier LMNP? As-tu des questions sur la fiscalité LMNP ou souhaites-tu faire une simulation pour comparer les régimes Micro-BIC et Régime réel?"
      );
    }
  }

  // formatStateForPrompt removed in favor of InfoState.toPromptVars()

  /**
   * Create dynamic prompt template with LangChain
   */
  createPromptTemplate() {
    const basePrompt = this.loadSystemPrompt();
    
    this.promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', basePrompt],
      ['placeholder', '{chat_history}'],
      ['human', '{input}'],
    ]);
  }

  /**
   * Load the system prompt from file
   */
  loadSystemPrompt() {
    try {
      const promptPath = join(__dirname, './system_prompt.txt');
      return readFileSync(promptPath, 'utf-8');
    } catch (error) {
      console.error('Error loading system prompt file, using default:', error.message);
      return 'Tu es un assistant expert en fiscalité immobilière française LMNP.';
    }
  }

  // getStateInfo removed - we now compute variables inline in processMessage

  /**
   * Process a user message - updates internal state
   */
  async processMessage(message) {
    try {
      // Add user message to memory
      await this.memory.addUserMessage(message);

      // Get conversation history from memory
      const historyMessages = await this.memory.getHistory();
      
      // Prepare variables for dynamic prompt using a formatter (pydantic-like toString)
      const state_json = JSON.stringify(this.infoState.toJSON(), null, 2);

      // Check if we have all required info for simulation
      const isComplete = this.extractor.isComplete(this.infoState.toJSON());
      let simulation_results;
      
      if (isComplete) {
        // Calculate and format simulation results using simulator's toString method
        const results = this.simulator.calculate(this.infoState.toJSON());
        simulation_results = this.simulator.toString(results);
      } else {
        // Information still missing
        simulation_results = `Les résultats de simulation ne sont pas encore prêts car il manque des informations. Tu dois continuer à poser des questions pour obtenir les données manquantes`;
      }

      // Use LangChain prompt template with variables
      const formattedPrompt = await this.promptTemplate.formatMessages({
        state_json,
        simulation_results,
        chat_history: historyMessages,
        input: message,
      });

      // Call LLM with formatted prompt
      const response = await this.llm.invoke(formattedPrompt);

      // Add AI response to memory
      await this.memory.addAIMessage(response.content || String(response));

      // Use extraction agent to get updated state from conversation
      const historyArray = await this.memory.getHistoryAsArray();
      const updatedState = await this.extractor.extractData(historyArray, this.infoState.toJSON());
      this.infoState.update(updatedState);
    } catch (error) {
      console.error('Error processing message:', error);
      throw new Error('Failed to process message');
    }
  }

  /**
   * Get the last AI reply from history
   */
  async getReply() {
    const history = await this.getHistoryArray();
    if (history.length === 0) return null;
    const lastMessage = history[history.length - 1];
    return lastMessage.role === 'assistant' ? lastMessage.content : null;
  }

  /**
   * Check if all required info is complete
   */
  isDone() {
    return this.extractor.isComplete(this.infoState.toJSON());
  }

  /**
   * Get history as array for frontend
   */
  async getHistoryArray() {
    return await this.memory.getHistoryAsArray();
  }

  /**
   * Reset conversation memory
   */
  async resetMemory() {
    await this.memory.clear();
    this.infoState = new InfoState();
  }
}

