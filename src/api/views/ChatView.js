/**
 * Chat View Handler
 * Processes chat messages and returns AI responses with simulations
 */
export class ChatView {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  async handlePost(req, res) {
    try {
      const { message } = req.body;
      const sessionId = req.sessionId;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Get session-specific chatbot and simulator
      const chatbot = this.sessionManager.getChatbot(sessionId);
      const simulator = this.sessionManager.getSimulator();

      // Process message
      await chatbot.processMessage(message);

      // Get AI reply
      const reply = await chatbot.getReply();

      // Calculate simulation if done
      const isDone = chatbot.isDone();
      const state = chatbot.infoState.toJSON();
      const simulation = isDone ? { 
        ...simulator.calculate(state), 
        state 
      } : null;

      res.json({
        reply,
        simulation,
        sessionId,
      });
    } catch (error) {
      console.error('Error processing chat message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

