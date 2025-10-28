import 'dotenv/config';
import { Chatbot } from './lib/agents/chatbot/chatbot.js';
import { TaxSimulator } from './lib/simulator.js';
import readline from 'readline';

// Initialize the chatbot and simulator
const chatbot = new Chatbot();
const simulator = new TaxSimulator();

// Interactive CLI loop until chatbot has all required info
async function main() {
  console.log('LMNP Chatbot initialized...');
  console.log('Type your messages. Ctrl+C to exit.\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

  try {
    while (!chatbot.isDone()) {
      const userInput = await ask('You: ');
      if (!userInput || !userInput.trim()) continue;

      await chatbot.processMessage(userInput.trim());
      const reply = await chatbot.getReply();
      console.log('AI:', reply || '(no reply)');

      console.log('State:', chatbot.infoState.toJSON());
      console.log('Done:', chatbot.isDone());
    }

    // When done, compute and show simulation
    const simulation = simulator.calculate(chatbot.infoState.toJSON());
    console.log('\nSimulation ready:');
    console.log(simulation);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { chatbot };

