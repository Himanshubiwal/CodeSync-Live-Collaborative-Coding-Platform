import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPageContainer from './pages/LandingPageContainer.jsx';
import RoomPageContainer from './pages/RoomPageContainer.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPageContainer />} />
      <Route path="/room/:roomId" element={<RoomPageContainer />} />
      {/* Catch-all fallback */}
      <Route path="*" element={<LandingPageContainer />} />
    </Routes>
  );
}
