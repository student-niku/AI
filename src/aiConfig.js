// AI Configuration
export const AI_CONFIG = {
  API_TYPE: 'openai', // 'gemini' या 'openai'
  OPENAI: {
    API_KEY: 'your-openai-key-here', // अपना OpenAI API key डालें
    API_URL: 'https://api.openai.com/v1/chat/completions',
    MODEL: 'gpt-3.5-turbo'
  },
  GEMINI: {
    API_KEY: 'AIzaSyAYbvDjh9t9nJCobZzhynTQv8dEyj5R0E8',
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
  }
};
