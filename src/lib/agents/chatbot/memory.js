import { HumanMessage, AIMessage } from '@langchain/core/messages';

/**
 * Conversation memory using LangChain message classes
 * Stores conversation history as HumanMessage and AIMessage objects
 */
export class ConversationMemory {
  constructor() {
    this.history = [];
  }

  /**
   * Add a human message to the conversation history
   */
  async addUserMessage(message) {
    this.history.push(new HumanMessage(message));
  }

  /**
   * Add an AI message to the conversation history
   */
  async addAIMessage(message) {
    this.history.push(new AIMessage(message));
  }

  /**
   * Get conversation history as LangChain message objects
   */
  async getHistory() {
    return this.history;
  }

  /**
   * Get conversation history as simple text array (for API compatibility)
   */
  async getHistoryAsArray() {
    return this.history.map(msg => ({
      role: msg.constructor.name === 'HumanMessage' ? 'user' : 'assistant',
      content: msg.content || msg.text,
    }));
  }

  /**
   * Clear conversation history
   */
  async clear() {
    this.history = [];
  }

  /**
   * Get history count
   */
  async getHistoryLength() {
    return this.history.length;
  }
}

