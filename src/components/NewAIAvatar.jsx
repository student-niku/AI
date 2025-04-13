import { useState, useEffect } from 'react';
import { DEEPAI_CONFIG } from '../apiConfig';

const NewAIAvatar = ({ isSpeaking }) => {
  const [avatarImage, setAvatarImage] = useState('https://img.freepik.com/free-photo/robotic-human-heart-futuristic-representation_23-2151681127.jpg?semt=ais_hybrid&w=740');

  useEffect(() => {
    const generateAvatar = async () => {
      try {
        const response = await fetch(DEEPAI_CONFIG.IMAGE_GENERATION.API_URL, {
          method: 'POST',
          headers: {
            'api-key': DEEPAI_CONFIG.IMAGE_GENERATION.API_KEY
          },
          body: new URLSearchParams({ 
            text: 'Friendly Hindi AI assistant avatar, cartoon style'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setAvatarImage(data.output_url);
        }
      } catch (error) {
        console.error('Avatar generation failed, using default');
      }
    };

    generateAvatar();
  }, []);

  return (
    <div style={{
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      overflow: 'hidden',
      margin: '0 auto 20px',
      border: isSpeaking ? '3px solid #4CAF50' : '3px solid #ddd',
      transition: 'all 0.3s ease'
    }}>
      <img 
        src={avatarImage}
        alt="AI Assistant"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
};

export default NewAIAvatar;
