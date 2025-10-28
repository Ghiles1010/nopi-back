import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ConversationMemory } from './memory.js';
import { InvestmentExtractor } from './extractor.js';
import InfoState from './models/infoState.js';
import { TaxSimulator } from './simulator.js';

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
    
    // Initialize tax simulator
    this.simulator = new TaxSimulator();
    
    // Track extracted state across conversation (Pydantic-like model)
    this.infoState = new InfoState();

    // Create dynamic prompt template
    this.createPromptTemplate();
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
      const promptPath = join(__dirname, '../prompts/system_prompt.txt');
      return readFileSync(promptPath, 'utf-8');
    } catch (error) {
      console.error('Error loading system prompt file, using default:', error.message);
      return 'Tu es un assistant expert en fiscalité immobilière française LMNP.';
    }
  }

  // getStateInfo removed - we now compute variables inline in processMessage

  /**
   * Process a user message and return AI response with extracted data
   */
  async processMessage(message, conversationHistory = []) {
    try {
      // Add user message to memory
      await this.memory.addUserMessage(message);

      // Get conversation history from memory
      const historyMessages = await this.memory.getHistory();
      
      // Prepare variables for dynamic prompt using a formatter (pydantic-like toString)
      const state_json = JSON.stringify(this.infoState.toJSON(), null, 2);

      // Use LangChain prompt template with variables
      const formattedPrompt = await this.promptTemplate.formatMessages({
        state_json,
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

      // Return response in the format expected by the frontend
      return {
        reply: response.content || String(response),
        state: this.infoState.toJSON(),
        simulation: this.extractor.isComplete(this.infoState.toJSON()) 
          ? this.simulator.calculate(this.infoState.toJSON()) 
          : null,
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw new Error('Failed to process message');
    }
  }

  /**
   * Reset conversation memory
   */
  async resetMemory() {
    await this.memory.clear();
    this.infoState = new InfoState();
  }

  /**
   * Get current conversation history
   */
  async getHistory() {
    return await this.memory.getHistoryAsArray();
  }
}

