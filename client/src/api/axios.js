import axios from 'axios';

// 1. We create an 'instance' of axios. 
// This means we don't have to type "http://localhost:5001/api" over and over again!
const API = axios.create({
  baseURL: 'http://localhost:5001/api', // Pointing to our Node.js backend
});

// 2. The Interceptor (The Frontend Security Guard)
// Before ANY request leaves the browser, this function runs.
API.interceptors.request.use((req) => {
  // We check if the user has a VIP Wristband (JWT) saved in their LocalStorage
  const token = localStorage.getItem('token');
  
  if (token) {
    // If they do, we clip it onto their request header!
    req.headers.Authorization = `Bearer ${token}`;
  }
  
  return req; // Send the request out to the backend
});

export default API;
