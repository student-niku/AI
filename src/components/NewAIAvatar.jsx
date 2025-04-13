const NewAIAvatar = ({ isSpeaking }) => {
  const AVATAR_IMAGE = 'https://img.freepik.com/free-photo/robotic-human-heart-futuristic-representation_23-2151681127.jpg?semt=ais_hybrid&w=740';

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
        src={AVATAR_IMAGE}
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
