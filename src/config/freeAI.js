// Free AI API Configuration
export const FREE_AI_OPTIONS = {
  // Hugging Face (Free Tier)
  HUGGINGFACE: {
    API_KEY: 'your_hf_key_here', // Get from huggingface.co/settings/tokens
    API_URL: 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
    HEADERS: {
      'Authorization': 'Bearer ${API_KEY}',
      'Content-Type': 'application/json'
    }
  },

  // Ollama (Local Setup)
  OLLAMA: {
    API_URL: 'http://localhost:11434/api/generate',
    MODEL: 'llama2' // Install via 'ollama pull llama2'
  }
};
