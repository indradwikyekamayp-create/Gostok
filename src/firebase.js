import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCTBUJUtqTAk_EaBzXu9TgAgUVYcIkpmoI",
  authDomain: "systempos-7c48d.firebaseapp.com",
  projectId: "systempos-7c48d",
  storageBucket: "systempos-7c48d.firebasestorage.app",
  messagingSenderId: "418821251121",
  appId: "1:418821251121:web:ad39a71e45ade2996db510",
  measurementId: "G-33MBRXJ9Q2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Secondary app for creating users without logging out current user
const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
export const secondaryAuth = getAuth(secondaryApp);
