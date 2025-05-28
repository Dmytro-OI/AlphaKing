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

  // Filter out eliminated players
  const filteredPlayers = players.filter(p => !eliminatedPlayers.includes(p.id));
  const angleStep = (2 * Math.PI) / filteredPlayers.length;

  return (
    <div className="players-circle" style={{ position: 'relative', width: 300, height: 300 }}>
      {filteredPlayers.length > 0 && (() => {
        const currentIndex = filteredPlayers.findIndex(p => p.id === currentPlayerId);
        const angleDeg = currentIndex * (360 / filteredPlayers.length);
        return <div className="turn-arrow" style={{ transform: `translate(-50%, -100%) rotate(${angleDeg}deg)` }} />;
      })()}

      {players.map((player, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const isActive = player.id === currentPlayerId;
        const isExploding = player.id === explodingPlayer;
        const isEliminated = eliminatedPlayers.includes(player.id);

        return (
          <div
            key={player.id}
            className={`player-slot${isActive ? ' active' : ''} ${isExploding ? ' exploding' : ''} ${isEliminated ? ' eliminated' : ''}`}
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
              pointerEvents: isExploding || isEliminated ? 'none' : 'auto',
              zIndex: isActive ? 5 : 1,
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

              {isActive && !isExploding && !isEliminated && (
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
