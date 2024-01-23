
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD6vsmWFnE7XgJMOV0gyplFAj_o4IqPf0Y",
    authDomain: "healthpass-4b9c9.firebaseapp.com",
    projectId: "healthpass-4b9c9",
    storageBucket: "healthpass-4b9c9.appspot.com",
    messagingSenderId: "670486203232",
    appId: "1:670486203232:web:1d776d83e09e37bd8aac05",
    measurementId: "G-DHVWPZQSZC"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore as default };
