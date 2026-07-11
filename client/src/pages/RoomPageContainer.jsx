import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoomPage from '../components/Room/RoomPage.jsx';

export default function RoomPageContainer() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const handleLeaveRoom = () => {
    navigate('/');
  };

  return (
    <RoomPage
      roomId={roomId}
      onLeaveRoom={handleLeaveRoom}
    />
  );
}
