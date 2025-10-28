/**
 * Reset View Handler
 * Resets the chatbot conversation
 */
export class ResetView {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  async handlePost(req, res) {
    try {
      const sessionId = req.sessionId;
      await this.sessionManager.resetSession(sessionId);
      res.json({ 
        success: true, 
        message: 'Chatbot reset successfully',
        sessionId,
      });
    } catch (error) {
      console.error('Error resetting chatbot:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

