// src/components/Signup.jsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import firestore from '../firebase';
const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user details to the 'users' collection in Firestore
      const usersCollection = collection(firestore, 'users');
      const userDocRef = doc(usersCollection, user.uid);
      
      // Use setDoc to create or update the document with the same ID as the user
      await setDoc(userDocRef, {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName || null,
        createdAt: serverTimestamp(),
      });

      // Clear form and error on successful signup
      setEmail('');
      setPassword('');
      setError(null);

      console.log('User signed up successfully!');
    } catch (error) {
      setError(error.message);
      console.error('Error signing up:', error);
    }
  };

  return (
    <div>
      <h1>Sign Up</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSignup}>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <br />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
