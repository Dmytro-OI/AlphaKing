// src/components/WinnerScreen.jsx
import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext'; // Імпортуємо useGame для доступу до контексту

const WinnerScreen = ({ countdown }) => {
  const { winner } = useGame(); // Отримуємо переможця з контексту

  return (
    <div className="winner-overlay">
      <div className="winner-content">
        <h2>🏆 Гра завершена!</h2>
        <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          {winner ? `👑 Переможець: ${winner.username}` : 'Гра завершилась без переможця'}
        </p>
        {countdown !== undefined && countdown !== null && (
          <p style={{ fontSize: '1.25rem', color: '#ffd700' }}>
            Перенаправлення через {countdown} {countdown === 1 ? 'секунду' : 'секунд'}
          </p>
        )}
        <p style={{ marginTop: '2rem', fontStyle: 'italic', color: '#aaa' }}>
          Хост може почати нову гру у цьому лобі.
        </p>
      </div>
      <style>{`
        .winner-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .winner-content {
          background: #1a1d29;
          padding: 2.5rem 3rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 0 30px #ffd700aa;
          color: #ffd700;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          user-select: none;
        }
      `}</style>
    </div>
  );
};

export default WinnerScreen;
