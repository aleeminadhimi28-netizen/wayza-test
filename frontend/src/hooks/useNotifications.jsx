import { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import {
  initiateSocketConnection,
  joinUserRoom,
  subscribeToNotifications,
  disconnectSocket,
} from '../utils/socket.js';

export function useNotifications(user) {
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function fetchNotifs() {
      try {
        const res = await api.getNotifications();
        if (res.ok) setNotifs(res.data || []);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    }
    fetchNotifs();
    const int = setInterval(fetchNotifs, 300000); // 5-min fallback — socket handles real-time

    initiateSocketConnection();
    joinUserRoom(user.email);
    const unsubscribe = subscribeToNotifications((notification) => {
      setNotifs((prev) => [notification, ...prev].slice(0, 20));
    });

    return () => {
      clearInterval(int);
      unsubscribe();
      disconnectSocket();
    };
  }, [user]);

  async function openNotifs() {
    setShowNotifs((prev) => !prev);
    if (!showNotifs && notifs.some((n) => !n.read)) {
      await api.markNotificationsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  return { notifs, setNotifs, showNotifs, setShowNotifs, openNotifs };
}
