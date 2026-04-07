import { useEffect } from 'react';
import { io } from 'socket.io-client';

// We initialize the connection to our backend
// Pointing directly to our HTTP Server URL where Socket.io is listening
const socket = io("http://localhost:5001");

export const useNotifications = () => {

  useEffect(() => {
    // 1. When the component mounts, get the current logged in user
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      
      // 2. Tell the backend "Hey, User XYZ is online!"
      socket.emit('register_user', user._id);
    }

    // 3. Start listening for incoming 'notification' events
    socket.on('notification', (data) => {
      // In a real app, you could use a library like 'react-toastify' or state!
      console.log("DING! Live Notification:", data);
      alert(data.message); // Temporarily alerts the user directly
    });

    // 4. Cleanup listener when the component unmounts
    return () => {
      socket.off('notification');
    };
  }, []);

};
