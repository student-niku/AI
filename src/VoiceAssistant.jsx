import './app-new.css';
import { useState, useEffect, useRef } from 'react';
import NewAIAvatar from './components/NewAIAvatar';
import { GEMINI_CONFIG } from './apiConfig';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Press button to start microphone');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef(null);

  const addToConversation = (role, message) => {
    const formattedMessage = typeof message === 'string' 
      ? { type: 'text', content: message }
      : message;
    setConversation(prev => [{ role, message: formattedMessage }, ...prev]);
  };

  const getGeminiResponse = async (instruction) => {
    try {
      const apiUrl = `${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: instruction }]
          }]
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 
             "माफ़ कीजिए, मैं इस प्रश्न का उत्तर नहीं दे पा रहा हूँ";
    } catch (error) {
      console.error('API Error:', error);
      return "माफ़ कीजिए, तकनीकी समस्या आई है। कृपया बाद में प्रयास करें।";
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Set the language to Hindi
    speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setStatus('माइक्रोफोन बंद');
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setStatus('सुन रहा हूँ... बोलें');
    }
  };

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setStatus('कृपया Chrome ब्राउज़र का उपयोग करें');
      return;
    }

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'hi-IN';

    recognitionRef.current.onresult = async (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      console.log('Recognized speech:', finalTranscript);

      if (finalTranscript.trim() !== '') {
        addToConversation('user', {type: 'text', content: finalTranscript});
        setIsLoading(true);

        const response = await getGeminiResponse(finalTranscript);
        addToConversation('assistant', {type: 'text', content: response});
        speakText(response);

        setIsLoading(false);
      }
    };

    recognitionRef.current.onerror = (event) => {
      setStatus(`त्रुटि: ${event.error}`);
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  return (
    <div className="voice-assistant">
      <NewAIAvatar isSpeaking={isListening || isLoading} />
      <div className="voice-controls">
        <div className="button-container">
          <button onClick={toggleListening} className={isListening ? 'listening' : ''}>
              {isListening ? 'Stop' : 'Start'}
          </button>
        </div>
        <div className="status">
          {isLoading ? <div className="loading-spinner"></div> : status}
        </div>
        <div className="conversation">
          {conversation.map((item, index) => (
            <div key={index} className={`message ${item.role}`}>
              {item.message.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;