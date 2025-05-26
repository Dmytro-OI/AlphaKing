import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
        </Routes>
        <ToastContainer
          position="bottom-center"
          theme="colored"
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
        />
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
