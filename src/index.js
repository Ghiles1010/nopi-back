import 'dotenv/config';
import { Chatbot } from './chatbot.js';

// Initialize the chatbot
const chatbot = new Chatbot();

// Example usage - Test conversation flow
async function main() {
  console.log('LMNP Chatbot initialized...');
  console.log('Testing conversation with memory...\n');
  
  try {
    // First message
    console.log('📤 User: "J\'achète un studio à 150 000€, loyer 800€/mois"');
    let response = await chatbot.processMessage("J'achète un studio à 150 000€, loyer 800€/mois", []);
    console.log('📥 AI:', response.reply);
    console.log('\nSimulation:', response.simulation);
    
    // Second message - with conversation context
    console.log('\n\n📤 User: "Quels sont les impôts avec le régime Micro-BIC ?"');
    response = await chatbot.processMessage("Quels sont les impôts avec le régime Micro-BIC ?", []);
    console.log('📥 AI:', response.reply);
    
    // Check conversation history
    const history = await chatbot.getHistory();
    console.log('\n\n📊 Conversation History:');
    console.log(history);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { chatbot };

