import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// @ts-ignore
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB62ZiaU6RAd8I39HW0jD3FgCWn6IwgKQw",
  authDomain: "smart-library-98837.firebaseapp.com",
  databaseURL: "https://smart-library-98837-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-library-98837",
  storageBucket: "smart-library-98837.firebasestorage.app",
  messagingSenderId: "399428567137",
  appId: "1:399428567137:web:c8894aab74e94a7a896a20",
  measurementId: "G-SZ23QDW0VD"
};

const app = initializeApp(firebaseConfig);

// Lưu trạng thái đăng nhập trên thiết bị
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getDatabase(app);