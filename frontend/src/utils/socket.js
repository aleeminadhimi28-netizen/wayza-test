import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket;

export const initiateSocketConnection = () => {
  socket = io(BASE_URL, {
    withCredentials: true,
  });
  console.log(`Connecting socket...`);
};

export const disconnectSocket = () => {
  console.log('Disconnecting socket...');
  if (socket) socket.disconnect();
};

export const subscribeToMessages = (cb) => {
  if (!socket) return true;
  socket.on('new_message', (msg) => {
    console.log('Websocket event received!');
    return cb(null, msg);
  });
};

export const joinBookingRoom = (bookingId) => {
  if (socket) socket.emit('join_room', bookingId);
};

export const leaveBookingRoom = (bookingId) => {
  if (socket) socket.emit('leave_room', bookingId);
};
