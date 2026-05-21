import { io } from 'socket.io-client';

import { BASE_URL } from './api.js';

let socket;

// FIX #126: Reference-counted connection management so multiple components calling
// initiateSocketConnection() don't fight over a single socket instance, and the
// socket is only truly disconnected when every consumer has called disconnectSocket().
let refCount = 0;

export const initiateSocketConnection = () => {
  refCount++;
  if (!socket || socket.disconnected) {
    socket = io(BASE_URL, {
      withCredentials: true,
      // Reconnect automatically on transient network drops
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  refCount = Math.max(0, refCount - 1);
  // Only actually disconnect when no more consumers are active
  if (refCount === 0 && socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Force-disconnect regardless of ref count (used on logout)
 */
export const forceDisconnectSocket = () => {
  refCount = 0;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Join a user-specific room for real-time notifications
 * @param {string} email - User email
 */
export const joinUserRoom = (email) => {
  if (socket && email) socket.emit('join_user', email);
};

/**
 * Subscribe to real-time notification pushes
 * @param {Function} cb - Callback receiving the notification object
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNotifications = (cb) => {
  if (!socket) return () => {};
  const handler = (notification) => cb(notification);
  socket.on('new_notification', handler);
  return () => socket.off('new_notification', handler);
};

/**
 * Subscribe to incoming chat messages.
 * FIX #126: Returns a proper unsubscribe function instead of boolean.
 * @param {Function} cb - Callback receiving (err, msg)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToMessages = (cb) => {
  if (!socket) return () => {};
  const handler = (msg) => cb(null, msg);
  socket.on('new_message', handler);
  // Return an unsubscribe function so callers can clean up their specific listener
  return () => socket.off('new_message', handler);
};

export const joinBookingRoom = (bookingId) => {
  if (socket) socket.emit('join_room', bookingId);
};

export const leaveBookingRoom = (bookingId) => {
  if (socket) socket.emit('leave_room', bookingId);
};
