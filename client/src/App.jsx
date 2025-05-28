import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GameProvider } from './context/GameContext';
import Home from './pages/Home';
import Game from './pages/Game';
import './styles.css';

function App() {
  console.log('App component rendering');
  
  return (
    <GameProvider>
      <BrowserRouter>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick={true}
            rtl={false}
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover={false}
            theme="dark"
            limit={3}
            style={{
              top: '1rem',
              right: '1rem',
              width: 'auto',
              maxWidth: '300px'
            }}
            toastStyle={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 16px',
              margin: '0 0 8px 0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              fontSize: '14px',
              fontWeight: '500',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          />
        </div>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
