import { nanoid } from 'nanoid';

/**
 * Generate a clean 8-character URL-safe Room ID.
 * Example output: "xK9f2pQm"
 */
export function generateRoomId() {
  return nanoid(8);
}
