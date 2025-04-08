import { useState, useEffect, useRef } from 'react';
import { FREE_AI_OPTIONS } from './config/freeAI';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('माइक्रोफोन शुरू करने के लिए बटन दबाएं');
  const [conversation, setConversation] = useState([]);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  const addToConversation = (role, message) => {
    setConversation(prev => [...prev, { role, message }]);
  };

  const getAIResponse = async (prompt) => {
    try {
      setStatus('प्रसंस्करण...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use Hugging Face API by default
      const response = await fetch(FREE_AI_OPTIONS.HUGGINGFACE.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FREE_AI_OPTIONS.HUGGINGFACE.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `हिंदी में संक्षिप्त उत्तर दें (50 शब्दों से कम): ${prompt}`
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      
      const data = await response.json();
      const responseText = Array.isArray(data) ? data[0].generated_text : "माफ़ कीजिए, उत्तर प्राप्त नहीं हुआ";
      
      setStatus('सुन रहा हूँ... बोलें');
      return responseText;
    } catch (error) {
      console.error('API Error:', error);
      setStatus('त्रुटि हुई, पुनः प्रयास करें');
      return "माफ़ कीजिए, तकनीकी समस्या आई है। कृपया बाद में प्रयास करें।";
    }
  };

  const speak = (text) => {
    if (synthRef.current.speaking) synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
    synthRef.current.speak(utterance);
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
    synthRef.current = window.speechSynthesis;

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

      if (finalTranscript.trim() !== '') {
        addToConversation('user', finalTranscript);
        const response = await getGeminiResponse(finalTranscript);
        addToConversation('assistant', response);
        speak(response);
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
      <h1>हिंदी वॉइस असिस्टेंट</h1>
      <div className="button-container">
        <button onClick={toggleListening} className={isListening ? 'listening' : ''}>
          {isListening ? 'बंद करें' : 'शुरू करें'}
        </button>
      </div>
      <div className="status">{status}</div>
      <div className="conversation">
        {conversation.map((item, index) => (
          <div key={index} className={`message ${item.role}`}>
            {item.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceAssistant;
