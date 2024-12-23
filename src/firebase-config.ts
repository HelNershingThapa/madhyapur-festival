// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "baato-edd41.firebaseapp.com",
  databaseURL:
    "https://baato-edd41-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "baato-edd41",
  storageBucket: "baato-edd41.appspot.com",
  messagingSenderId: "600355883790",
  appId: "1:600355883790:web:ee6cdbdbf6d01cd29be55f",
  measurementId: "G-0HS1CQWGVT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app);
