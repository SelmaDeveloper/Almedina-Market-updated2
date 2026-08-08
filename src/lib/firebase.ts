import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  reload,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC--FTjmtmElF6oPCOKAoZHS1jBGsXG-qg',
  authDomain: 'almadinamarket.firebaseapp.com',
  projectId: 'almadinamarket',
  storageBucket: 'almadinamarket.firebasestorage.app',
  messagingSenderId: '825161095198',
  appId: '1:825161095198:web:5e577819bda77dfcde760f',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  reload,
  sendPasswordResetEmail,
  type User,
};                                                

