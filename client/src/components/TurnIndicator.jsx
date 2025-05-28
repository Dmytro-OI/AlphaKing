// import React, { useEffect, useState, useMemo } from 'react';

// const TurnIndicator = ({ players = [], currentPlayerId }) => {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [eliminated, setEliminated] = useState([]);

//   // Знаходимо індекс активного гравця
//   useEffect(() => {
//     const idx = players.findIndex(p => p.id === currentPlayerId);
//     if (idx !== -1) setActiveIndex(idx);
//   }, [currentPlayerId, players]);

//   // Відслідковуємо вибулих гравців для fade-out
//   useEffect(() => {
//     setEliminated(prev => prev.filter(id => players.some(p => p.id === id)));
//     players.forEach(p => {
//       if (!p.alive && !eliminated.includes(p.id)) {
//         setEliminated(e => [...e, p.id]);
//       }
//     });
//   }, [players, eliminated]);

//   // Обчислюємо кути для гравців
//   const angleStep = useMemo(() => (players.length > 0 ? 360 / players.length : 0), [players.length]);

//   if (players.length === 0) return null;

//   return (
//     <div className="turn-indicator" style={{ position: 'relative', width: 320, height: 320 }}>
//       {players.map((player, i) => {
//         const rotation = angleStep * i;
//         const transform = `rotate(${rotation}deg) translate(130px) rotate(-${rotation}deg)`;
//         const isActive = i === activeIndex;
//         const isEliminated = eliminated.includes(player.id) && !player.alive;

//         return (
//           <div
//             key={player.id}
//             className={`player-slot${isActive ? ' active' : ''}${isEliminated ? ' eliminated' : ''}`}
//             style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform,
//               transition: 'transform 0.6s cubic-bezier(.4,2,.6,1), filter 0.4s, opacity 0.7s',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               fontWeight: isActive ? 'bold' : 'normal',
//               color: isActive ? '#ffcc00' : '#ccc',
//               userSelect: 'none',
//               pointerEvents: 'none',
//               zIndex: isActive ? 2 : 1,
//               filter: isActive ? 'drop-shadow(0 0 12px #ffcc00)' : 'none',
//               opacity: isEliminated ? 0 : 1,
//               transformOrigin: 'center',
//               scale: isActive ? 1.18 : 1,
//             }}
//             title={player.username}
//           >
//             <div style={{ fontSize: isActive ? 32 : 24, marginBottom: 4, transition: 'font-size 0.4s' }}>
//               🧑
//             </div>
//             <div style={{ fontSize: 14, whiteSpace: 'nowrap' }}>{player.username}</div>
//             {isActive && (
//               <div
//                 className="bomb bomb-glow"
//                 style={{
//                   marginTop: 4,
//                   fontSize: 24,
//                   animation: 'bombPulse 1s infinite ease-in-out',
//                   filter: 'drop-shadow(0 0 10px #ffcc00) drop-shadow(0 0 20px #ffcc00)',
//                   transition: 'font-size 0.4s',
//                 }}
//                 aria-label="current player"
//               >
//                 💣
//               </div>
//             )}
//           </div>
//         );
//       })}
//       <div
//         className="turn-arrow"
//         style={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           width: 0,
//           height: 0,
//           borderLeft: '18px solid transparent',
//           borderRight: '18px solid transparent',
//           borderBottom: '30px solid #ffcc00',
//           transformOrigin: '50% 100%',
//           transform: `rotate(${angleStep * activeIndex}deg) translate(-50%, -100%)`,
//           marginLeft: '-18px',
//           marginTop: '-150px',
//           filter: 'drop-shadow(0 0 6px #ffcc00)',
//           transition: 'transform 0.7s cubic-bezier(.4,2,.6,1)',
//           pointerEvents: 'none',
//           userSelect: 'none',
//           zIndex: 1000,
//         }}
//         aria-hidden="true"
//       />
//       <style>
//         {`
//           @keyframes bombPulse {
//             0%, 100% { transform: scale(1); opacity: 1; }
//             50% { transform: scale(1.3); opacity: 0.6; }
//           }
//           .bomb-glow {
//             animation-name: bombPulse;
//             animation-duration: 1s;
//             animation-iteration-count: infinite;
//             animation-timing-function: ease-in-out;
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default TurnIndicator;
