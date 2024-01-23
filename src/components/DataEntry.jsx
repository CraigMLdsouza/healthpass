// src/components/DataEntry.jsx
import React, { useState, useEffect } from 'react';
import { addDoc, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import firestore from '../firebase';

const DataEntry = () => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    // Add more fields as needed
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setUserId(user.uid);
      } else {
        // User is signed out
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDataEntry = async () => {
    if (!userId) {
      console.error('User ID not available');
      return;
    }

    try {
      // Create or update the 'users' document with the same ID as the user
      const usersCollection = collection(firestore, 'users');
      const userDocRef = doc(usersCollection, userId);
      // Create a subcollection 'dataEntries' within the 'users' document
      const dataEntriesCollection = collection(userDocRef, 'dataEntries');
      await addDoc(dataEntriesCollection, {
        timestamp: serverTimestamp(),
        ...formData,
      });

      // Clear the form after submission
      setFormData({
        name: '',
        dob: '',
        // Reset other fields as needed
      });

      console.log('Data entry added successfully!');
    } catch (error) {
      console.error('Error adding data entry:', error);
    }
  };

  const handleAddNewRecord = async () => {
    if (!userId) {
      console.error('User ID not available');
      return;
    }

    try {
      // Create a new subcollection 'dataEntries' within the 'users' document
      const usersCollection = collection(firestore, 'users');
      const userDocRef = doc(usersCollection, userId);
      const dataEntriesCollection = collection(userDocRef, 'dataEntries');
      await addDoc(dataEntriesCollection, {
        timestamp: serverTimestamp(),
        // You can initialize other fields for a new record here
      });

      console.log('New record added successfully!');
    } catch (error) {
      console.error('Error adding new record:', error);
    }
  };

  return (
    <div>
      <h1>Data Entry</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleDataEntry(); }}>
        <label>
          Name:
          <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </label>
        <br />
        <label>
          Date of Birth:
          <input type="text" name="dob" value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
        </label>
        <br />
        {/* Add more form fields here as needed */}
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default DataEntry;
