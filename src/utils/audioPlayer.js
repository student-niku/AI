const playAudio = (text) => {
  console.group('Audio Player Debug');
  console.log('Attempting to play audio for text:', text);

  // Test audio files - replace with your actual files
  const testAudioFiles = {
    'test': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'beep': 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3'
  };

  // Select test audio
  const audioFile = testAudioFiles['test']; 
  console.log('Using test audio file:', audioFile);

  try {
    const audio = new Audio(audioFile);
    
    audio.oncanplay = () => {
      console.log('Audio can play');
      audio.play().then(() => {
        console.log('Playback started successfully');
      }).catch(e => {
        console.error('Playback failed:', e);
        playFallback();
      });
    };
    
    audio.onerror = (e) => {
      console.error('Audio error:', e);
      playFallback();
    };
    
    console.log('Loading audio...');
    audio.load();
    
  } catch (e) {
    console.error('Audio initialization failed:', e);
    playFallback();
  }
  
  console.groupEnd();
};

const playFallback = () => {
  console.log('Attempting fallback beep');
  const beep = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
  beep.play().catch(e => console.error('Fallback beep failed:', e));
};

export default playAudio;
