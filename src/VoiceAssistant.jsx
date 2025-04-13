import './app-new.css';
import { useState, useEffect, useRef } from 'react';
import NewAIAvatar from './components/NewAIAvatar';
import { GEMINI_CONFIG, ELEVENLABS_CONFIG, DEEPAI_CONFIG } from './apiConfig';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Press button to start microphone');
  const [darkMode, setDarkMode] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(ELEVENLABS_CONFIG.VOICE_ID);
  const recognitionRef = useRef(null);

  const addToConversation = (role, message) => {
    // Handle both string and structured message formats
    const formattedMessage = typeof message === 'string' 
      ? { type: 'text', content: message }
      : message;
    setConversation(prev => [{ role, message: formattedMessage }, ...prev]);
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

  const speakText = async (text) => {
    return new Promise(async (resolve) => {
      // Try ElevenLabs first
      try {
        const elevenLabsResponse = await fetch(
          `${ELEVENLABS_CONFIG.API_URL}/${ELEVENLABS_CONFIG.VOICE_ID}`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': ELEVENLABS_CONFIG.API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text,
              model_id: ELEVENLABS_CONFIG.MODEL_ID
            })
          }
        );
        
        if (elevenLabsResponse.ok) {
          const audioBlob = await elevenLabsResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.onended = () => resolve();
          audio.play();
          return;
        }
      } catch (e) {
        console.log('ElevenLabs failed, trying browser TTS');
      }

      // Fallback to browser TTS
      try {
        const elevenLabsResponse = await fetch(
          `${ELEVENLABS_CONFIG.API_URL}/${ELEVENLABS_CONFIG.VOICE_ID}`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': ELEVENLABS_CONFIG.API_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text,
              model_id: ELEVENLABS_CONFIG.MODEL_ID
            })
          }
        );
        
        if (elevenLabsResponse.ok) {
          const audioBlob = await elevenLabsResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.onended = () => resolve();
          audio.play();
          return;
        }
      } catch (e) {
        console.log('ElevenLabs failed, trying browser TTS');
      }

      // Final fallback to browser TTS
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.onend = () => resolve();
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('All TTS methods failed');
        resolve();
      }
    });
  };

  const selectVoice = (utterance, voices) => {
    // Prefer Hindi voices, fallback to any available
    const hindiVoice = voices.find(v => v.lang.includes('hi-IN')) || 
                     voices.find(v => v.lang.includes('hi')) ||
                     voices.find(v => v.lang.includes('en'));
    
    if (hindiVoice) {
      utterance.voice = hindiVoice;
      console.log('Using voice:', hindiVoice.name);
    } else {
      console.warn('No Hindi voice found. Available voices:', voices);
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
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

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
        addToConversation('user', {type: 'text', content: finalTranscript});
        setIsLoading(true);
        
        if (finalTranscript.toLowerCase().includes('image') || 
            finalTranscript.toLowerCase().includes('चित्र')) {
          const imageUrl = await generateImage(finalTranscript);
          if (imageUrl) {
            addToConversation('assistant', {type: 'image', content: imageUrl});
            const description = await getGeminiResponse(`Describe this image in Hindi in one sentence: ${finalTranscript}`);
            addToConversation('assistant', {type: 'text', content: description});
            speakText(description);
          } else {
            const errorMsg = "माफ़ कीजिए, मैं चित्र नहीं बना पाया";
            addToConversation('assistant', {type: 'text', content: errorMsg});
            speakText(errorMsg);
          }
        } else {
          const response = await getGeminiResponse(finalTranscript);
          addToConversation('assistant', {type: 'text', content: response});
          speakText(response);
        }
        
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
    <div className={`voice-assistant ${darkMode ? 'dark-mode' : ''}`}>
      <NewAIAvatar isSpeaking={isListening || isLoading} />
      <div className="voice-controls">
        <div className="button-container">
          <button onClick={toggleListening} className={isListening ? 'listening' : ''}>
              {isListening ? 'Stop' : 'Start'}
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{marginLeft: '10px'}}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
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
          {conversation.map((item, index) => {
            const message = item.message;
            return (
              <div key={index} className={`message ${item.role}`}>
                {message.type === 'image' ? (
                  <>
                    <img 
                      src={message.content} 
                      alt="Generated AI art"
                      style={{
                        maxWidth: '100%',
                        borderRadius: '8px',
                        marginTop: '10px'
                      }}
                    />
                    {conversation[index+1]?.message?.type === 'text' && (
                      <div style={{marginTop: '5px', fontStyle: 'italic'}}>
                        {conversation[index+1].message.content}
                      </div>
                    )}
                  </>
                ) : (
                  message.content
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
