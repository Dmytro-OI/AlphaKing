import React from 'react';

function TimerBar({ secondsLeft, totalSeconds }) {
  const progressPercent = (secondsLeft / totalSeconds) * 100;

  return (
    <div style={{
      width: '100%',
      height: '8px',
      backgroundColor: '#444',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '10px',
    }}>
      <div style={{
        height: '100%',
        width: `${progressPercent}%`,
        backgroundColor: '#4af',
        transition: 'width 0.2s linear', // Збільшив для плавності
        willChange: 'width',
        transform: 'translateZ(0)',
      }} />
    </div>
  );
}

export default TimerBar;
