import React, { useEffect, useState } from 'react';

function PlayersCircle({ players, currentPlayerId, eliminatedPlayers = [] }) {
  const [explodingPlayer, setExplodingPlayer] = useState(null);

  useEffect(() => {
    if (eliminatedPlayers.length > 0) {
      const lastEliminated = eliminatedPlayers[eliminatedPlayers.length - 1];
      setExplodingPlayer(lastEliminated);
      const timer = setTimeout(() => setExplodingPlayer(null), 500);
      return () => clearTimeout(timer);
    }
  }, [eliminatedPlayers]);

  const radius = 120;
  const centerX = 150;
  const centerY = 150;

  const renderHearts = (hp) => {
    return '❤️'.repeat(hp) + '🖤'.repeat(3 - hp); 
  };

  const visiblePlayers = players.filter(p => !eliminatedPlayers.includes(p.id));
  const angleStep = (2 * Math.PI) / visiblePlayers.length; // Розраховуємо крок кута на основі ВИДИМИХ гравців

  return (
    <div className="players-circle" style={{ position: 'relative', width: 300, height: 300 }}>
      {visiblePlayers.length > 0 && (() => {
         const currentIndex = visiblePlayers.findIndex(p => p.id === currentPlayerId);
         if (currentIndex === -1) return null; 

         const angleDeg = currentIndex * (360 / visiblePlayers.length);
         return <div className="turn-arrow" style={{ transform: `translate(-50%, -100%) rotate(${angleDeg}deg)` }} />;
      })()}

      {players.map((player) => {
        const isEliminated = eliminatedPlayers.includes(player.id);

        if (isEliminated) {
          return null;
        }

        const visibleIndex = visiblePlayers.findIndex(p => p.id === player.id);
        if (visibleIndex === -1) return null; 

        const angle = visibleIndex * angleStep - Math.PI / 2;

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const isActive = player.id === currentPlayerId;
        const isExploding = player.id === explodingPlayer;

        const playerHp = player.hp !== undefined ? player.hp : 3; 

        return (
          <div
            key={player.id}
            className={`player-slot${isActive ? ' active' : ''} ${isExploding ? ' exploding' : ''}`}
            style={{
              position: 'absolute',
              top: y,
              left: x,
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              userSelect: 'none',
              fontWeight: isActive ? 'bold' : 'normal',
              color: isActive ? '#ffd700' : '#ccc',
              filter: isActive ? 'drop-shadow(0 0 8px #ffd700)' : 'none',
              transition: 'color 0.5s ease, filter 0.5s ease, opacity 0.5s ease, transform 0.5s ease',
              pointerEvents: isExploding ? 'none' : 'auto', 
              zIndex: isActive ? 5 : 1,
              paddingBottom: '20px', 
            }}
            title={player.username}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                userSelect: 'none',
                fontSize: 36,
                marginBottom: 4,
                position: 'relative',
              }}
            >
              <span>🧑</span>

              <div
                className="player-name"
                style={{
                  fontWeight: '600',
                  fontSize: 14,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 120,
                  margin: 0,
                  paddingTop: 0,
                  filter: isActive ? 'drop-shadow(0 0 10px #ffd700)' : 'none',
                }}
              >
                {player.username}
              </div>

              {!isExploding && player.hp !== undefined && (
                 <div className="player-hp" style={{ fontSize: 16, marginTop: 4 }}>
                   {renderHearts(playerHp)}
                 </div>
              )}

              {isActive && !isExploding && (
                <div
                  className="bomb"
                  style={{
                    fontSize: 28,
                    animation: 'bombPulse 2s infinite ease-in-out',
                    color: '#ff4500',
                    filter: 'drop-shadow(0 0 10px #ff4500)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    marginTop: 6,
                    position: 'static',
                    transform: 'none',
                    zIndex: 10,
                  }}
                >
                  💣
                </div>
              )}

              {isExploding && (
                <div
                  className="explosion"
                  style={{
                    fontSize: 36,
                    animation: 'explodeAnim 0.5s forwards',
                    color: '#ff3300',
                    filter: 'drop-shadow(0 0 15px #ff3300)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    marginTop: 6,
                    position: 'static',
                    transform: 'none',
                    zIndex: 15,
                  }}
                >
                  💥
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PlayersCircle;
