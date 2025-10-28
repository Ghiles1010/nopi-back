import 'dotenv/config';
import { Chatbot } from './chatbot.js';
import { TaxSimulator } from './simulator.js';

// Initialize the chatbot and simulator
const chatbot = new Chatbot();
const simulator = new TaxSimulator();

// Example usage - Test conversation flow
async function main() {
  console.log('LMNP Chatbot initialized...');
  console.log('Testing conversation with memory...\n');
  
  try {
    // First message
    console.log('📤 User: "J\'achète un studio à 150 000€, loyer 800€/mois"');
    await chatbot.processMessage("J'achète un studio à 150 000€, loyer 800€/mois");
    console.log('📥 AI:', await chatbot.getReply());
    
    // Check state and calculate simulation if done
    console.log('\nState:', chatbot.infoState.toJSON());
    console.log('Is Done:', chatbot.isDone());
    
    if (chatbot.isDone()) {
      const simulation = simulator.calculate(chatbot.infoState.toJSON());
      console.log('\nSimulation:', simulation);
    } else {
      console.log('\nSimulation: null (waiting for more info)');
    }
    
    // Second message - with conversation context
    console.log('\n\n📤 User: "Quels sont les impôts avec le régime Micro-BIC ?"');
    await chatbot.processMessage("Quels sont les impôts avec le régime Micro-BIC ?");
    console.log('📥 AI:', await chatbot.getReply());
    
    // Check conversation history
    console.log('\n\n📊 Conversation History:');
    console.log(await chatbot.getHistoryArray());
    console.log('\nState:', chatbot.infoState.toJSON());
    console.log('Is Done:', chatbot.isDone());
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { chatbot };

