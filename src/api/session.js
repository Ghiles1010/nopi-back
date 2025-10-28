import { Chatbot } from '../lib/agents/chatbot/chatbot.js';
import { TaxSimulator } from '../lib/simulator.js';

/**
 * Session Manager
 * Manages user sessions with isolated chatbot instances
 */
export class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.simulator = new TaxSimulator();
  }

  /**
   * Get or create a session for a user
   */
  getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      const chatbot = new Chatbot();
      this.sessions.set(sessionId, {
        chatbot,
        createdAt: new Date(),
        lastAccessed: new Date(),
      });
    }
    
    const session = this.sessions.get(sessionId);
    session.lastAccessed = new Date();
    return session;
  }

  /**
   * Get chatbot for a session
   */
  getChatbot(sessionId) {
    return this.getSession(sessionId).chatbot;
  }
  
  /**
   * Create a new chatbot instance
   */
  _createChatbot() {
    return new Chatbot();
  }

  /**
   * Get simulator (shared across all sessions)
   */
  getSimulator() {
    return this.simulator;
  }

  /**
   * Reset a session - completely replaces the chatbot with a fresh instance
   */
  async resetSession(sessionId) {
    // Delete the old session to force creation of a fresh one
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
    }
    // The next time getSession is called, it will create a fresh chatbot instance
    return true;
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * Clean up old sessions (optional: implement automatic cleanup)
   */
  cleanup(maxAge = 60 * 60 * 1000) { // Default 1 hour
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastAccessed > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get session stats
   */
  getStats() {
    return {
      totalSessions: this.sessions.size,
      sessions: Array.from(this.sessions.keys()),
    };
  }
}

export default SessionManager;

