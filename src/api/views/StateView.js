/**
 * State View Handler
 * Returns current chatbot state and history
 */
export class StateView {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  async handleGet(req, res) {
    try {
      const sessionId = req.sessionId;
      const chatbot = this.sessionManager.getChatbot(sessionId);

      const state = chatbot.infoState.toJSON();
      const isDone = chatbot.isDone();
      const history = await chatbot.getHistoryArray();

      res.json({
        state,
        isDone,
        history,
        sessionId,
      });
    } catch (error) {
      console.error('Error getting state:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

