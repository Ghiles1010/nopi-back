import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import SessionManager from './session.js';
import { ChatView } from './views/ChatView.js';
import { StateView } from './views/StateView.js';
import { ResetView } from './views/ResetView.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize session manager
const sessionManager = new SessionManager();

// Session middleware - extracts session ID from headers or body
app.use((req, res, next) => {
  req.sessionId = req.headers['x-session-id'] || req.body?.sessionId || 'default';
  next();
});

// Initialize views
const chatView = new ChatView(sessionManager);
const stateView = new StateView(sessionManager);
const resetView = new ResetView(sessionManager);

/**
 * POST /api/chat
 * Process a user message and return AI response
 */
app.post('/api/chat', (req, res) => chatView.handlePost(req, res));

/**
 * GET /api/state
 * Get current chatbot state
 */
app.get('/api/state', (req, res) => stateView.handleGet(req, res));

/**
 * POST /api/reset
 * Reset chatbot conversation
 */
app.post('/api/reset', (req, res) => resetView.handlePost(req, res));

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 LMNP Backend API running on http://localhost:${PORT}`);
  console.log(`   POST /api/chat - Send message to chatbot`);
  console.log(`   GET  /api/state - Get current state`);
  console.log(`   POST /api/reset - Reset conversation`);
});

export default app;

