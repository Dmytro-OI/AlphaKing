import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

function WordInput({ word, setWord, onSubmit }) {
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onInvalid = () => {
      try {
        console.log('Invalid word event received');
        setShake(true);
        setError('Неправильне слово!');
        setTimeout(() => {
          setShake(false);
          setError(null);
        }, 500);
      } catch (error) {
        console.error('Error handling invalid word:', error);
      }
    };

    socket.on('invalidWord', onInvalid);
    return () => {
      try {
        socket.off('invalidWord', onInvalid);
      } catch (error) {
        console.error('Error cleaning up invalid word listener:', error);
      }
    };
  }, []);

  const handleSubmit = () => {
    try {
      if (!word.trim()) {
        setError('Введи слово!');
        return;
      }
      setError(null);
      onSubmit();
    } catch (error) {
      console.error('Error submitting word:', error);
      setError('Помилка при відправці слова');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <input
        className={shake ? 'input-shake' : ''}
        value={word}
        onChange={e => {
          try {
            setWord(e.target.value);
            setError(null);
          } catch (error) {
            console.error('Error updating word:', error);
          }
        }}
        placeholder="Введи слово"
        onKeyDown={e => {
          try {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          } catch (error) {
            console.error('Error handling key press:', error);
          }
        }}
        autoFocus
      />
      {error && <div style={{ color: '#ff4e4e', marginTop: '4px' }}>{error}</div>}
      <button onClick={handleSubmit}>Надіслати</button>
      <style>{`
        .input-shake {
          animation: inputShake 0.5s;
          border: 2px solid #ff4e4e;
        }
        @keyframes inputShake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export default WordInput;
