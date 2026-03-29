import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAIJDwNla-_1qAfCVmjYBsSVVLwePv7kL0",
  authDomain: "zahad2-5f7bd.firebaseapp.com",
  projectId: "zahad2-5f7bd",
  storageBucket: "zahad2-5f7bd.firebasestorage.app",
  messagingSenderId: "863696158397",
  appId: "1:863696158397:web:eddc7b12c2aa0a456901d4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);