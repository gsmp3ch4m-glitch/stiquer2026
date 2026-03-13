import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBBn_dKjP_RgUM9GbO5c7rQdEivuZfGFkQ",
  authDomain: "stiquer-pro-2026-pm.firebaseapp.com",
  projectId: "stiquer-pro-2026-pm",
  storageBucket: "stiquer-pro-2026-pm.firebasestorage.app",
  messagingSenderId: "524104734696",
  appId: "1:524104734696:web:4160d54b132221812cb65d"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

export const storage = getStorage(app);

export default app;
