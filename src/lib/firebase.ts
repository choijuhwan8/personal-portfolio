import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCIlf6IqAm2ncw3Pv3SeL-q2dlymJMXOU0",
  authDomain: "portfolio-7aa51.firebaseapp.com",
  projectId: "portfolio-7aa51",
  storageBucket: "portfolio-7aa51.firebasestorage.app",
  messagingSenderId: "707385100370",
  appId: "1:707385100370:web:956cf29bd6d25ed359b78b",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
