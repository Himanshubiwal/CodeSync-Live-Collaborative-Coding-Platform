import { Router } from 'express';
import { generateRoomId } from '../utils/generateId.js';

const router = Router();

/**
 * POST /api/room
 * Create a new room and return { roomId }
 */
router.post('/', (req, res) => {
  const roomId = generateRoomId();
  console.log(`[Room API] Created new room ID: ${roomId}`);
  res.status(201).json({ roomId });
});

/**
 * GET /api/room/:id
 * Check if a room exists
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ roomId: id, exists: true });
});

export default router;
