import { useState, useEffect } from 'react';
import { DEEPAI_CONFIG } from '../apiConfig';

const AIAvatar = ({ isSpeaking }) => {
  const [avatarImage, setAvatarImage] = useState(null);

  useEffect(() => {
    const generateAvatar = async () => {
      try {
        const response = await fetch(DEEPAI_CONFIG.IMAGE_GENERATION.API_URL, {
          method: 'POST',
          headers: {
            'api-key': DEEPAI_CONFIG.IMAGE_GENERATION.API_KEY
          },
          body: new URLSearchParams({ 
            text: 'A friendly Hindi-speaking AI assistant avatar, cartoon style'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setAvatarImage(data.output_url);
        }
      } catch (error) {
        console.error('Avatar generation error:', error);
      }
    };

    generateAvatar();
  }, []);

  return (
    <div className="ai-avatar">
      {avatarImage ? (
        <img 
          src={avatarImage} 
          alt="AI Assistant Avatar"
          className={isSpeaking ? 'speaking' : ''}
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: isSpeaking ? '3px solid #4CAF50' : '3px solid #ddd',
            transition: 'all 0.3s ease'
          }}
        />
      ) : (
        <div className="avatar-placeholder" style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          backgroundColor: '#ddd'
        }}></div>
      )}
    </div>
  );
};

export default AIAvatar;
