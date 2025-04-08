// Google Gemini API Configuration
export const GEMINI_CONFIG = {
  API_KEY: 'AIzaSyAYbvDjh9t9nJCobZzhynTQv8dEyj5R0E8', // User's actual API key
  MODEL: 'gemini-1.5-pro-latest',
  get API_URL() {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL}:generateContent`;
  }
};
