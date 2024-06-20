// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDEGxCKS3_CFVxDZU7Qo2R2fPTjuwSFsCY",
  authDomain: "projeto1-83f1c.firebaseapp.com",
  projectId: "projeto1-83f1c",
  storageBucket: "projeto1-83f1c.appspot.com",
  messagingSenderId: "806655846722",
  appId: "1:806655846722:web:45b8525d7ba70339c5"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);

export { db, auth, storage };