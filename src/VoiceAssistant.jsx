import { useState, useEffect, useRef } from 'react';
import Avatar from './components/Avatar';
import { GEMINI_CONFIG, ELEVENLABS_CONFIG } from './apiConfig';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Press button to start microphone');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(ELEVENLABS_CONFIG.VOICE_ID);
  const recognitionRef = useRef(null);

  const addToConversation = (role, message) => {
    setConversation(prev => [...prev, {role, message}]);
  };

  const getGeminiResponse = async (instruction) => {
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_CONFIG.API_KEY}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: instruction
            }]
          }]
        })
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.error?.message || JSON.stringify(errorData)}`;
        } catch (e) {
          errorMessage += ` - ${await response.text()}`;
        }
        console.error('Gemini API Error Details:', {
          url: apiUrl,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`API error: ${errorMessage}`);
      }
      
      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                         "माफ़ कीजिए, मैं इस प्रश्न का उत्तर नहीं दे पा रहा हूँ";
      
      setIsLoading(false);
      setStatus('सुन रहा हूँ... बोलें');
      return responseText;
    } catch (error) {
      console.error('API Error:', error);
      setIsLoading(false);
      setStatus('त्रुटि हुई, पुनः प्रयास करें');
      return "माफ़ कीजिए, तकनीकी समस्या आई है। कृपया बाद में प्रयास करें।";
    }
  };

  const speakUsingElevenLabs = async (text) => {
    try {
      const response = await fetch(
        `${ELEVENLABS_CONFIG.API_URL}/${selectedVoice}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_CONFIG.API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: ELEVENLABS_CONFIG.MODEL_ID,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          })
        }
      );

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.error?.message || JSON.stringify(errorData)}`;
        } catch (e) {
          errorMessage += ` - ${await response.text()}`;
        }
        console.error('ElevenLabs API Error Details:', {
          url: `${ELEVENLABS_CONFIG.API_URL}/${selectedVoice}`,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`ElevenLabs API error: ${errorMessage}`);
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('ElevenLabs Error:', error);
      // Fallback to default speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
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

      if (finalTranscript.trim() !== '') {
        addToConversation('user', finalTranscript);
        setIsLoading(true);
        const response = await getGeminiResponse(finalTranscript);
        addToConversation('assistant', response);
        speakUsingElevenLabs(response);
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
      <h1>Hindi Voice Assistant</h1>
      <Avatar isSpeaking={isListening || isLoading} />
      <div className="voice-controls">
        <div className="button-container">
          <button onClick={toggleListening} className={isListening ? 'listening' : ''}>
              {isListening ? 'Stop' : 'Start'}
          </button>
        </div>
      
        <div className="voice-selection">
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
          >
            <option value="21m00Tcm4TlvDq8ikWAM">Hindi Voice 1</option>
            <option value="AZnzlk1XvdvUeBnXmlld">Hindi Voice 2</option>
          </select>
        </div>
        <div className="status">
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : (
            status
          )}
        </div>
        <div className="conversation">
          {conversation.map((item, index) => (
            <div key={index} className={`message ${item.role}`}>
              {item.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
