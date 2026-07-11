import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config.js';
import LandingPage from '../components/Landing/LandingPage.jsx';

export default function LandingPageContainer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        navigate(`/room/${data.roomId}`);
      } else {
        throw new Error('Failed to create room on server');
      }
    } catch (err) {
      console.warn('Backend not running or unreachable, using local fallback ID:', err);
      const fallbackId = Math.random().toString(36).substring(2, 10);
      navigate(`/room/${fallbackId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (roomId) => {
    if (roomId) {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <LandingPage
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleJoinRoom}
      loading={loading}
    />
  );
}
